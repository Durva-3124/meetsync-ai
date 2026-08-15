# MOM JSON Schema Design Guide for Frontend
**Version 1.0** | Prepared for Frontend Lead & Review Editor  
**Last Updated:** 2025-08-14

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Core JSON Structure](#core-json-structure)
3. [API Endpoints](#api-endpoints)
4. [Frontend Editor Widgets](#frontend-editor-widgets)
5. [Example Implementations](#example-implementations)
6. [Integration Checklist](#integration-checklist)

---

## Overview

The MOM (Minutes of Meeting) JSON schema is designed for:
- **AI-Generated Drafts:** Auto-populated from meeting transcripts, diarization, and embeddings
- **Direct Rendering:** Frontend editor can render MOM sections without transformation
- **Review Tracking:** Each edit creates a ReviewVersion entry (diff tracking in place)
- **Type-Safe Integration:** Full TypeScript interfaces available in `backend/src/types/MomSchema.ts`
- **Export Ready:** Structure supports direct conversion to DOCX/PDF

### Key Design Principles

| Principle | Implementation |
|-----------|-----------------|
| **Componentized** | Each MOM section (attendees, summary, keyPoints, actionItems) is independently editable |
| **Audit Trail** | ReviewVersion stores original + edited values with word-level diffs |
| **Source Attribution** | Every item tagged as 'ai' (auto-generated) or 'manual' (reviewer-added) |
| **Linked Data** | Action items link to Tasks; key points link to decisions; cites reference transcript |

---

## Core JSON Structure

### Root Level: `IMomJSON`

```typescript
{
  // Meeting reference
  meetingId: string;                    // ObjectId of Meeting
  title: string;                        // from Meeting.title
  
  // Editable sections
  attendees: IAttendee[];               // Who was in the meeting
  summary: string;                      // Meeting summary (rich text)
  keyPoints: IKeyPoint[];               // Discussion highlights
  draftActionItems: IDraftActionItem[]; // Action items (to Task)
  
  // Metadata
  generatedAt: Date;
  source: 'ai' | 'manual';
  version: number;
  metrics?: {
    transcriptAccuracy: number;         // 0-100
    summaryCoherence: number;           // 0-100
    actionItemsExtraction: number;      // 0-100
  };
}
```

---

### Section 1: Attendees

**Purpose:** List of people in the meeting with speaking stats

**Data Structure:**
```typescript
interface IAttendee {
  userId: string;           // User ObjectId
  name: string;             // Display name
  role: 'organizer' | 'participant';
  speakingDuration?: number; // seconds
  turnsTaken?: number;       // count of speaking turns
}
```

**Example:**
```json
{
  "attendees": [
    {
      "userId": "507f1f77bcf86cd799439001",
      "name": "Alice Johnson",
      "role": "organizer",
      "speakingDuration": 450,
      "turnsTaken": 12
    },
    {
      "userId": "507f1f77bcf86cd799439002",
      "name": "Bob Chen",
      "role": "participant",
      "speakingDuration": 320,
      "turnsTaken": 8
    }
  ]
}
```

**Frontend Rendering:**
- **Display:** Read-only table or sidebar list
- **Columns:** Name | Role | Speaking Time | # of Turns
- **Sorting:** By speaking duration (descending)
- **Metadata:** Display speaking time as `HH:MM` format
- **Not Editable** (derived from Meeting.participants)

**Example Table:**
```
Name              Role        Speaking Time   # Turns
Alice Johnson     Organizer   7:30           12
Bob Chen          Participant 5:20            8
Carol Martinez    Participant 3:00            5
```

---

### Section 2: Summary

**Purpose:** High-level meeting recap (30-60 sentences)

**Data Structure:**
```typescript
summary: string;  // Plain text or Markdown
```

**Example:**
```
The team met to plan Q3 deliverables and align on priorities. 
Alice opened with the vision: deliver the new search functionality 
and complete the mobile app redesign. 

The conversation centered on three areas: (1) Timeline feasibility 
given team capacity, (2) Technical debt paydown in parallel with 
feature work, and (3) Dependencies with the design team.

Alice emphasized that search is critical for user retention—we're 
losing users to faster competitors. Bob raised concerns about the 
mobile redesign timeline; he estimates 6 weeks vs. the planned 4...
```

**Frontend Rendering:**
- **Widget:** Rich text editor (Markdown or plain)
- **Editing:**
  - Multiline text input
  - Character counter (200-5000 chars)
  - Placeholder: "Enter meeting summary..."
- **Features:**
  - Bold/italic formatting
  - Bullet points (optional)
  - Undo/redo
- **AI Source:** Show confidence badge if `metrics.summaryCoherence < 85`

**CSS/Styling Hints:**
```css
.mom-summary {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 4px;
  min-height: 300px;
}

.mom-summary-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

### Section 3: Key Points

**Purpose:** Tagged list of discussion highlights (decisions, blockers, milestones)

**Data Structure:**
```typescript
interface IKeyPoint {
  id: string;                // UUID for tracking
  source: 'ai' | 'manual';   // Auto-extracted or manually added
  category: 'decision' | 'milestone' | 'blocker' | 'general';
  text: string;              // Key point text
  speaker?: string;          // Who said it
  timestamp?: number;        // seconds in recording (for playback)
  relatedTaskIds?: string[]; // ObjectIds of related Tasks
  citations?: {              // Reference to transcript
    start: number;           // char offset
    end: number;
    text: string;
  }[];
}
```

**Example:**
```json
{
  "keyPoints": [
    {
      "id": "kp-001",
      "source": "ai",
      "category": "milestone",
      "text": "Q3 priorities: new search functionality + mobile app redesign",
      "speaker": "Alice Johnson",
      "timestamp": 45,
      "relatedTaskIds": ["507f1f77bcf86cd799439101"],
      "citations": [{
        "start": 120,
        "end": 210,
        "text": "deliver the new search functionality and complete the mobile app redesign"
      }]
    },
    {
      "id": "kp-002",
      "source": "ai",
      "category": "blocker",
      "text": "Mobile redesign estimated at 6 weeks, not the planned 4 weeks",
      "speaker": "Bob Chen",
      "timestamp": 280
    },
    {
      "id": "kp-003",
      "source": "ai",
      "category": "decision",
      "text": "Search prioritized over mobile polish in Q3; cosmetics deferred to Q4",
      "speaker": "Alice Johnson",
      "timestamp": 520
    }
  ]
}
```

**Frontend Rendering:**

**Display Mode (Read-Only):**
- **Cards or List Items** with category badges:
  ```
  🎯 Decision  | Search prioritized over mobile polish in Q3...
  ⚠️  Blocker   | Mobile redesign estimated at 6 weeks...
  📍 Milestone | Q3 priorities: search + mobile redesign...
  ```

**Edit Mode (Interactive):**
- **Add Button:** "+ Add Key Point" at bottom
- **Inline Edit:** Click to edit text in-place
- **Delete:** Trash icon on hover
- **Category Selector:** Dropdown to change badge type
- **Speaker Attribution:** Optional field showing who said it
- **Timestamp Link:** If available, link to recording playback at that timestamp

**Color Coding by Category:**
```css
.kp-decision { background: #e3f2fd; border-left: 4px solid #1976d2; }
.kp-blocker { background: #fff3e0; border-left: 4px solid #f57c00; }
.kp-milestone { background: #e8f5e9; border-left: 4px solid #388e3c; }
.kp-general { background: #f5f5f5; border-left: 4px solid #999; }
```

**Editing Modal (on click):**
```
┌────────────────────────────────────────┐
│ Edit Key Point                     [×] │
├────────────────────────────────────────┤
│ Category: [Decision ▼]                 │
│ Text: [Multi-line input...]            │
│ Speaker: [Optional text]               │
│ Timestamp: [0:45]                      │
├────────────────────────────────────────┤
│ [Cancel]  [Save]                       │
└────────────────────────────────────────┘
```

---

### Section 4: Draft Action Items

**Purpose:** To-do list with assignment, due dates, and linked decisions

**Data Structure:**
```typescript
interface IDraftActionItem {
  id: string;                  // ObjectId (links to Task)
  source: 'ai' | 'manual';
  task: string;                // Action item text
  assignee: string;            // Who owns it (name)
  assigneeUserId?: string;     // Optional User ObjectId
  dueDate?: string;            // ISO date or human-readable ("2 weeks")
  priority?: 'high' | 'medium' | 'low';
  status: 'draft' | 'assigned' | 'in_progress' | 'done';
  requiredSkills?: string[];   // e.g., ["backend", "database"]
  relatedDecisions?: string[]; // refs to keyPoints[].id
  citations?: {
    start: number;
    end: number;
    text: string;
  }[];
}
```

**Example:**
```json
{
  "draftActionItems": [
    {
      "id": "507f1f77bcf86cd799439101",
      "source": "ai",
      "task": "Design and implement backend search indexing for full-text search",
      "assignee": "Bob Chen",
      "assigneeUserId": "507f1f77bcf86cd799439002",
      "dueDate": "2025-09-15",
      "priority": "high",
      "status": "draft",
      "requiredSkills": ["backend", "database-design", "elasticsearch"],
      "relatedDecisions": ["kp-003"]
    },
    {
      "id": "manual-002",
      "source": "manual",
      "task": "Schedule design team alignment meeting",
      "assignee": "Alice Johnson",
      "dueDate": "2025-08-18",
      "priority": "medium",
      "status": "draft"
    }
  ]
}
```

**Frontend Rendering:**

**Display Mode (Table View):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Task                            │ Assignee    │ Due       │ Priority │
├─────────────────────────────────────────────────────────────────────┤
│ Design backend search indexing  │ Bob Chen    │ Sep 15    │ High     │
│ Implement full-text search      │ Bob Chen    │ Sep 15    │ High     │
│ Mobile UX redesign (phase 1)    │ Carol M.    │ Aug 31    │ High     │
│ Define search SLOs              │ Alice J.    │ Aug 20    │ High     │
│ Schedule design alignment       │ Alice J.    │ Aug 18    │ Medium   │
└─────────────────────────────────────────────────────────────────────┘
```

**Edit Mode (Inline Row Editing):**
- **Add Button:** "+ New Action Item" below table
- **Inline Edit:** Click any cell to edit
- **Assignee Autocomplete:** Dropdown from attendees list
- **Due Date Picker:** Calendar widget
- **Delete:** Trash icon on hover

**Row Item Component:**
```jsx
<div className="action-item-row">
  <span className={`priority-badge ${priority}`}>{priority}</span>
  <input type="text" value={task} />
  <select>{attendees}</select>
  <input type="date" value={dueDate} />
  <select>{['draft', 'assigned', 'in_progress', 'done']}</select>
  <button onClick={delete}>×</button>
</div>
```

**Priority Colors:**
```css
.priority-high { background: #ffebee; color: #c62828; }
.priority-medium { background: #fff3e0; color: #e65100; }
.priority-low { background: #e8f5e9; color: #2e7d32; }
```

**Status Badge:**
- `draft` → Gray pill "Draft"
- `assigned` → Blue pill "Assigned"
- `in_progress` → Orange pill "In Progress"
- `done` → Green pill "Done"

---

## API Endpoints

### GET `/api/meetings/:id/mom`
Retrieve MOM with review metadata

**Response:**
```json
{
  "mom": { /* IMomJSON */ },
  "reviewVersion": {
    "version": 1,
    "reviewedBy": "Alice Johnson",
    "reviewedAt": "2025-08-14T14:35:00Z",
    "locked": false
  },
  "editableBy": true,
  "canLock": true
}
```

**Status Codes:**
- `200 OK` – MOM retrieved
- `404 Not Found` – Meeting or MOM not found
- `409 Conflict` – Meeting still processing (processingStatus !== 'completed')

---

### PATCH `/api/meetings/:id/mom`
Update MOM fields (creates ReviewVersion entry)

**Request Body:**
```json
{
  "summary": "Updated summary text...",
  "keyPoints": [{ /* updated key points */ }],
  "draftActionItems": [{ /* updated action items */ }],
  "attendees": [{ /* optional */ }]
}
```

**Response:**
```json
{
  "message": "MoM updated successfully",
  "mom": { /* updated IMomJSON */ },
  "version": 2
}
```

**Status Codes:**
- `200 OK` – Updated
- `403 Forbidden` – Not authorized to edit
- `409 Conflict` – Review version is locked

---

### POST `/api/meetings/:id/mom/:momId/lock`
Lock current MOM version (admin only, prevent further edits)

**Response:**
```json
{
  "message": "MoM version locked successfully",
  "version": 1,
  "lockedAt": "2025-08-14T15:00:00Z"
}
```

---

## Frontend Editor Widgets

### Widget Map (How to Render Each Section)

| Section | Widget Type | Editable | Features |
|---------|-------------|----------|----------|
| **attendees** | Static Table | No | Sort by speaking time; show duration |
| **summary** | Rich Text Editor | Yes | Markdown; auto-save; char counter |
| **keyPoints** | List with Tagging | Yes | Add/delete/edit; category badges; speaker attribution |
| **draftActionItems** | Table with Inline Edit | Yes | Add/delete; assignee dropdown; due date picker; priority select |

### Recommended Component Stack

#### For React:
```typescript
// Core Components
<MomViewer mom={momData} editable={canEdit} onSave={handleSave} />

// Sub-components
<AttendeesList attendees={mom.attendees} />
<SummaryEditor value={mom.summary} onChange={setSummary} />
<KeyPointsList keyPoints={mom.keyPoints} onChange={setKeyPoints} />
<ActionItemsTable items={mom.draftActionItems} onChange={setActionItems} />
```

#### For Vue:
```vue
<template>
  <div class="mom-editor">
    <AttendeesList :attendees="mom.attendees" />
    <SummaryEditor v-model="mom.summary" />
    <KeyPointsList v-model="mom.keyPoints" />
    <ActionItemsTable v-model="mom.draftActionItems" />
  </div>
</template>
```

---

## Example Implementations

### Example 1: Summary Editor Component

```jsx
// React Example
function SummaryEditor({ value, onChange, source }) {
  return (
    <div className="summary-editor">
      {source === 'ai' && <ConfidenceBadge score={87} />}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter meeting summary..."
        minLength={200}
        maxLength={5000}
      />
      <CharacterCount current={value.length} max={5000} />
    </div>
  );
}
```

### Example 2: Action Items Table

```jsx
function ActionItemsTable({ items, onChange }) {
  const [editing, setEditing] = useState(null);

  const handleEdit = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <table className="action-items">
      <thead>
        <tr>
          <th>Task</th>
          <th>Assignee</th>
          <th>Due Date</th>
          <th>Priority</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={item.id} className={`priority-${item.priority}`}>
            <td>
              <input
                type="text"
                value={item.task}
                onChange={(e) => handleEdit(idx, 'task', e.target.value)}
              />
            </td>
            <td>
              <select
                value={item.assignee}
                onChange={(e) => handleEdit(idx, 'assignee', e.target.value)}
              >
                {attendees.map((a) => (
                  <option key={a.userId}>{a.name}</option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="date"
                value={item.dueDate}
                onChange={(e) => handleEdit(idx, 'dueDate', e.target.value)}
              />
            </td>
            <td>{item.priority}</td>
            <td>{item.status}</td>
            <td>
              <button onClick={() => removeItem(idx)}>×</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Example 3: Key Points List with Categories

```jsx
function KeyPointsList({ keyPoints, onChange }) {
  const categoryColors = {
    decision: '#1976d2',
    blocker: '#f57c00',
    milestone: '#388e3c',
    general: '#999',
  };

  return (
    <ul className="key-points">
      {keyPoints.map((kp) => (
        <li key={kp.id} style={{ borderLeftColor: categoryColors[kp.category] }}>
          <span className="category-badge">{kp.category}</span>
          <span className="speaker">{kp.speaker}</span>
          <span className="text">{kp.text}</span>
          <button onClick={() => removeKeyPoint(kp.id)}>×</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## Integration Checklist

### Phase 1: Backend Setup ✅
- [x] Updated `Mom.ts` model with new schema
- [x] Created `MomSchema.ts` with TypeScript interfaces
- [x] Updated `momRoutes.ts` with GET/PATCH/POST endpoints
- [x] Integrated with ReviewVersion for audit trail

### Phase 2: Frontend Components (To Do)
- [ ] Create `<MomViewer />` container component
- [ ] Implement `<AttendeesList />` (read-only table)
- [ ] Implement `<SummaryEditor />` (rich text)
- [ ] Implement `<KeyPointsList />` (add/edit/delete with categories)
- [ ] Implement `<ActionItemsTable />` (inline edit table)
- [ ] Add styling (CSS or Tailwind)
- [ ] Add form validation (client-side)
- [ ] Add error handling & loading states

### Phase 3: Testing
- [ ] Test GET endpoint returns correct structure
- [ ] Test PATCH endpoint updates all fields
- [ ] Test ReviewVersion creation on edit
- [ ] Test permissions (edit/lock roles)
- [ ] Test UI with different MOM sizes (5–50 action items)
- [ ] Test on mobile/tablet viewports

### Phase 4: Integration with Export
- [ ] Connect MOM → DOCX export pipeline
- [ ] Connect MOM → PDF export pipeline
- [ ] Add header/footer to exports
- [ ] Test formatting in Word/PDF

---

## Quick Reference: Type Imports

```typescript
// In your frontend components
import {
  IMomJSON,
  IAttendee,
  IKeyPoint,
  IDraftActionItem,
  IMomResponse,
  MOM_RESPONSE_EXAMPLE,
} from '@backend/types/MomSchema';
```

---

## Questions for Frontend Lead

Before implementation, please confirm:

1. **Rich Text Editor:** Should summary support Markdown, HTML, or plain text?
2. **Mobile Layout:** Should we use a card layout or table for action items on mobile?
3. **Real-Time Sync:** Should edits auto-save or require explicit "Save" button?
4. **Assignee Resolution:** Can we query Users API for attendee autocomplete, or use meeting participants?
5. **Export Format:** Should exported MOM include speaker attribution and timestamps?
6. **Permissions:** Can employees edit their own MOM, or only admins/organizers?

---

## Related Files

- Backend Model: `src/models/Mom.ts`
- Schema Types: `src/types/MomSchema.ts`
- Routes: `src/routes/momRoutes.ts`
- Review Tracking: `src/models/ReviewVersion.ts`
- Meeting Model: `src/models/Meeting.ts`

---

**Last Updated:** 2025-08-14  
**Schema Version:** 1.0  
**Status:** Ready for Frontend Implementation
