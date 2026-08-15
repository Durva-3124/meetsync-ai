# MOM JSON Schema - Frontend Quick Reference
**Print this for your desk while implementing the MOM editor**

---

## API Endpoints at a Glance

```
GET  /api/meetings/:id/mom              ← Fetch MOM + metadata
PATCH /api/meetings/:id/mom             ← Update MOM fields
POST /api/meetings/:id/mom/:momId/lock  ← Lock version (admin only)
```

---

## Response Structure (What You Get from Backend)

```json
{
  "mom": {
    "meetingId": "string",
    "title": "string",
    "attendees": [
      { "userId": "string", "name": "string", "role": "string", 
        "speakingDuration": number, "turnsTaken": number }
    ],
    "summary": "string (rich text)",
    "keyPoints": [
      { "id": "string", "source": "ai|manual", "category": "decision|milestone|blocker|general",
        "text": "string", "speaker": "string", "timestamp": number }
    ],
    "draftActionItems": [
      { "id": "string", "source": "ai|manual", "task": "string", "assignee": "string",
        "assigneeUserId": "string", "dueDate": "string", "priority": "high|medium|low",
        "status": "draft|assigned|in_progress|done", "requiredSkills": ["string"] }
    ],
    "generatedAt": "Date",
    "source": "ai|manual",
    "version": number,
    "metrics": { "transcriptAccuracy": number, "summaryCoherence": number, "actionItemsExtraction": number }
  },
  "reviewVersion": {
    "version": number,
    "reviewedBy": "string",
    "reviewedAt": "Date",
    "locked": boolean
  },
  "editableBy": boolean,
  "canLock": boolean
}
```

---

## Section Rendering Guide

| Section | Type | Widget | Editable | Display Hint |
|---------|------|--------|----------|--------------|
| **Attendees** | Table | Static | ❌ No | Name \| Role \| Speaking Time \| # Turns |
| **Summary** | Rich Text | Editor | ✅ Yes | 200-5000 chars, multiline |
| **Key Points** | List | Tagged List | ✅ Yes | Category badge (color-coded) + speaker |
| **Action Items** | Table | Inline Edit | ✅ Yes | Task \| Assignee \| Due Date \| Priority \| Status |

---

## Color Scheme (Key Points by Category)

```
🎯 Decision    → Blue    (#1976d2)
⚠️  Blocker     → Orange  (#f57c00)
📍 Milestone   → Green   (#388e3c)
📝 General     → Gray    (#999999)
```

---

## Component Pseudocode

```jsx
<MomEditor meetingId={id} canEdit={user.isAdmin || user.createdMeeting}>

  {/* 1. Attendees (Read-Only) */}
  <AttendeesList attendees={mom.attendees} />

  {/* 2. Summary (Editable Rich Text) */}
  <SummaryEditor 
    value={mom.summary} 
    onChange={setSummary}
    minLength={200}
    maxLength={5000}
  />

  {/* 3. Key Points (Editable List) */}
  <KeyPointsList 
    keyPoints={mom.keyPoints}
    onChange={setKeyPoints}
    editable={canEdit}
    onAdd={() => addNewKeyPoint()}
  />

  {/* 4. Action Items (Editable Table) */}
  <ActionItemsTable 
    items={mom.draftActionItems}
    onChange={setActionItems}
    attendees={mom.attendees}
    editable={canEdit}
    onAdd={() => addNewActionItem()}
  />

  {/* 5. Buttons */}
  {canEdit && (
    <>
      <button onClick={save}>Save Changes</button>
      {canLock && <button onClick={lock}>Lock Version</button>}
    </>
  )}

</MomEditor>
```

---

## Editing Workflow

### Adding a Key Point
1. User clicks "+ Add Key Point"
2. Modal opens with fields: `category`, `text`, `speaker`
3. User fills in and clicks "Save"
4. New item appears in list with `source: 'manual'`

### Editing Action Item
1. User clicks on table row
2. Inline editor activates for each field
3. Assignee field shows dropdown (from attendees)
4. Due date field shows calendar picker
5. Status field shows select (draft → assigned → in_progress → done)
6. Changes auto-save or require explicit save button

### Locking MOM
1. Admin clicks "Lock Version"
2. `locked: true` flag set on ReviewVersion
3. All editable fields become read-only
4. Show lock icon in UI

---

## Field Validation Rules

| Field | Required | Min Length | Max Length | Format |
|-------|----------|-----------|-----------|--------|
| Summary | ✓ | 200 | 5000 | Plain text |
| Key Point Text | ✓ | 10 | 500 | Plain text |
| Key Point Category | ✗ | – | – | Enum |
| Action Item Task | ✓ | 10 | 300 | Plain text |
| Action Item Assignee | ✓ | – | – | Autocomplete |
| Action Item Due Date | ✗ | – | – | YYYY-MM-DD |

---

## Error Handling

| Error | Status | What to Show |
|-------|--------|-------------|
| Meeting not found | 404 | "Meeting not found" |
| MOM not ready | 409 | "MOM is still being generated... check back in 30s" |
| Access denied | 403 | "You don't have permission to edit this MOM" |
| Version locked | 409 | "This MOM version is locked and cannot be edited" |
| Server error | 500 | "Something went wrong. Please try again." |

---

## Save Flow

```
User clicks "Save"
  ↓
Validate all fields (client-side)
  ↓ (if valid)
PATCH /api/meetings/:id/mom
  {
    "summary": "...",
    "keyPoints": [...],
    "draftActionItems": [...]
  }
  ↓
Backend updates Mom + creates ReviewVersion
  ↓
Response includes new version number
  ↓
Show toast: "Saved successfully (v2)"
```

---

## TypeScript Imports

```typescript
// Get types from backend
import type {
  IMomJSON,
  IAttendee,
  IKeyPoint,
  IDraftActionItem,
  IMomResponse,
} from '@/api/types'; // adjust path to your setup
```

---

## State Management Suggestion (React Hooks)

```typescript
const [mom, setMom] = useState<IMomJSON>(null);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [editedMom, setEditedMom] = useState<IMomJSON>(null);
const [reviewVersion, setReviewVersion] = useState(null);

// On mount
useEffect(() => {
  fetchMom(meetingId).then(response => {
    setMom(response.mom);
    setReviewVersion(response.reviewVersion);
    setEditedMom(response.mom); // working copy
  });
}, [meetingId]);

// On save
const handleSave = async () => {
  setIsSaving(true);
  const response = await updateMom(meetingId, {
    summary: editedMom.summary,
    keyPoints: editedMom.keyPoints,
    draftActionItems: editedMom.draftActionItems,
  });
  setMom(response.mom);
  setReviewVersion(response.reviewVersion);
  setIsSaving(false);
};
```

---

## Testing Checklist

- [ ] Fetch MOM → displays all 4 sections correctly
- [ ] Edit summary → PATCH works, ReviewVersion increments
- [ ] Add key point → source set to 'manual', appears in list
- [ ] Add action item → assignee shows as dropdown
- [ ] Assign action item → links to attendee userId
- [ ] Set due date → persists as ISO string
- [ ] Change priority → UI reflects change
- [ ] Lock version → disabled all edits, shows lock icon
- [ ] Permission check → non-owner cannot edit
- [ ] Error message → shows when save fails

---

## Performance Notes

- **Attendees count:** ~5-20 typical
- **Key points:** ~5-50
- **Action items:** ~5-100 (max)
- **Summary length:** ~500-2000 words
- **Total payload:** < 1MB typically

Consider pagination if action items > 50.

---

## Questions to Confirm with Backend Lead

- [ ] Should summary support Markdown or HTML?
- [ ] Are timestamps in key points for audio playback linking?
- [ ] Should we create Task records from action items, or just store in Mom?
- [ ] Can we fetch Users API for assignee autocomplete?

---

**Version:** 1.0  
**Last Updated:** 2025-08-14  
**Print & Keep at Desk →**
