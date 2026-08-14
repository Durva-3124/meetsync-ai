# MOM Schema Architecture Diagram

## Data Flow: Meeting → MOM → ReviewVersion

```
┌─────────────────────────────────────────────────────────────────────┐
│ User uploads recording + provides meeting details                   │
└────────────────────────┬────────────────────────────────────────────┘
                         ↓
            ┌────────────────────────────┐
            │   MEETING (Input)          │
            ├────────────────────────────┤
            │ • title                    │
            │ • description              │
            │ • scheduledAt              │
            │ • participants []          │
            │ • createdBy (organizer)    │
            │ • audioFileUrl             │
            │ • processingStatus         │
            └────────────┬───────────────┘
                         ↓
    ┌────────────────────────────────────────────────┐
    │ AI Processing Pipeline (async)                │
    ├────────────────────────────────────────────────┤
    │ 1. Speech-to-Text (Whisper)                    │
    │ 2. Speaker Diarization (PyAnnote)             │
    │ 3. Embeddings (SentenceTransformers)          │
    │ 4. Summarization + Key Point Extraction      │
    │ 5. Action Item Detection                      │
    └────────────┬───────────────────────────────────┘
                 ↓
        ┌────────────────────────────────┐
        │   MOM (AI Draft)               │
        ├────────────────────────────────┤
        │ Version: 1 (AI-generated)      │
        │ Source: 'ai'                   │
        │                                │
        │ attendees[]:                   │
        │  ├─ userId                     │
        │  ├─ name                       │
        │  ├─ role                       │
        │  ├─ speakingDuration           │
        │  └─ turnsTaken                 │
        │                                │
        │ summary: "..."                 │
        │                                │
        │ keyPoints[]:                   │
        │  ├─ id, source, category       │
        │  ├─ text, speaker, timestamp   │
        │  ├─ citations[]                │
        │  └─ relatedTaskIds[]           │
        │                                │
        │ draftActionItems[]:            │
        │  ├─ id, source, task           │
        │  ├─ assignee, dueDate          │
        │  ├─ priority, status           │
        │  ├─ requiredSkills[]           │
        │  └─ relatedDecisions[]         │
        │                                │
        │ metrics: {accuracy, coherence} │
        └────────────┬────────────────────┘
                     ↓
          ┌──────────────────────────┐
          │ Frontend: Review Editor  │
          ├──────────────────────────┤
          │ Reviewer opens MOM       │
          │ Reads AI-generated data  │
          │ Clicks "Edit" button     │
          └────────────┬─────────────┘
                       ↓
    ┌──────────────────────────────────────────┐
    │ EDIT SESSION (Frontend Form)             │
    ├──────────────────────────────────────────┤
    │                                          │
    │ [Summary Editor]                         │
    │ ┌──────────────────────────────────────┐ │
    │ │ Update summary text...               │ │
    │ └──────────────────────────────────────┘ │
    │                                          │
    │ [Key Points List]                        │
    │ ┌──────────────────────────────────────┐ │
    │ │ + Add Key Point                      │ │
    │ │ • Key point 1 [delete]               │ │
    │ │ • Key point 2 [delete] [edit]        │ │
    │ └──────────────────────────────────────┘ │
    │                                          │
    │ [Action Items Table]                     │
    │ ┌──────────────────────────────────────┐ │
    │ │ Task | Assignee | Due | Priority     │ │
    │ │ [...][Alice   ][...][High    ] [✎]   │ │
    │ │ + Add Action Item                    │ │
    │ └──────────────────────────────────────┘ │
    │                                          │
    │ [Save Button] [Lock Button]              │
    └────────────┬─────────────────────────────┘
                 ↓
      ┌──────────────────────────┐
      │ PATCH /api/meetings/:id/mom
      │ {                        │
      │   summary: "...",        │
      │   keyPoints: [...],      │
      │   draftActionItems: [...] 
      │ }                        │
      └──────────────┬───────────┘
                     ↓
    ┌────────────────────────────────────┐
    │   Backend: Update MOM              │
    ├────────────────────────────────────┤
    │ 1. Update Mom.summary              │
    │ 2. Update Mom.keyPoints[]          │
    │ 3. Update Mom.draftActionItems[]   │
    │ 4. Increment Mom.version → 2       │
    │ 5. Create ReviewVersion entry      │
    │    (tracks: field, original, edited, diff)
    └────────────┬─────────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ ReviewVersion (Version 1)          │
    ├────────────────────────────────────┤
    │ meetingId: "507f..."               │
    │ version: 1                         │
    │ reviewedBy: Alice (User)           │
    │ createdAt: 2025-08-14T14:35:00Z    │
    │                                    │
    │ fields: [                          │
    │   {                                │
    │     field: 'summary',              │
    │     source: 'manual',              │
    │     original: "AI summary...",     │
    │     edited: "Reviewer's version...",
    │     diff: [                        │
    │       { op: 'unchanged', value: '...' },
    │       { op: 'added', value: 'new text' },
    │       { op: 'removed', value: 'old text' }
    │     ]                              │
    │   }                                │
    │ ]                                  │
    │                                    │
    │ locked: false                      │
    └────────────┬─────────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ Another reviewer edits...          │
    │ Creates ReviewVersion (v2)         │
    │ Creates ReviewVersion (v3)         │
    │ ...                                │
    │ Admin clicks "Lock"                │
    │ ReviewVersion.locked = true        │
    │ No more edits allowed              │
    └────────────┬─────────────────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ EXPORT PIPELINE                    │
    ├────────────────────────────────────┤
    │ Fetch final Mom record             │
    │ Render to DOCX/PDF                 │
    │ Include metadata (version, locked) │
    │ Download to user                   │
    └────────────────────────────────────┘
```

---

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       MOM EDITOR INTERFACE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ MomEditor (Container)                                      │   │
│  │ Props: meetingId, canEdit, canLock                        │   │
│  │ State: mom, editedMom, isEditing, reviewVersion           │   │
│  │                                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Attendees    │  │  Summary     │  │  Key Points  │   │   │
│  │  │  Component   │  │  Component   │  │  Component   │   │   │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤   │   │
│  │  │ Read-only    │  │ Rich Text    │  │ Add/Edit/   │   │   │
│  │  │ Table        │  │ Editor       │  │ Delete List │   │   │
│  │  │              │  │              │  │             │   │   │
│  │  │ Columns:     │  │ Features:    │  │ Features:   │   │   │
│  │  │ • Name       │  │ • Multiline  │  │ • Category  │   │   │
│  │  │ • Role       │  │ • Markdown   │  │   badge     │   │   │
│  │  │ • Speak Time │  │ • Auto-save  │  │ • Speaker   │   │   │
│  │  │ • # Turns    │  │ • Char count │  │ • Timestamp │   │   │
│  │  │              │  │              │  │ • Related   │   │   │
│  │  │ Data:        │  │ Data:        │  │   tasks     │   │   │
│  │  │ mom.         │  │ mom.         │  │ Data:       │   │   │
│  │  │ attendees    │  │ summary      │  │ mom.        │   │   │
│  │  │              │  │              │  │ keyPoints   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Action Items Component                          │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ Inline-edit Table                               │  │   │
│  │  │                                                  │  │   │
│  │  │ Columns:                                         │  │   │
│  │  │ • Task (text input)                              │  │   │
│  │  │ • Assignee (autocomplete from attendees)         │  │   │
│  │  │ • Due Date (date picker)                         │  │   │
│  │  │ • Priority (select: high/medium/low)             │  │   │
│  │  │ • Status (select: draft/assigned/in_progress)    │  │   │
│  │  │ • Delete (trash icon)                            │  │   │
│  │  │                                                  │  │   │
│  │  │ Actions: + Add Item, Edit, Delete                │  │   │
│  │  │ Data: mom.draftActionItems                       │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌────────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │ [Save Changes] │  │ [Lock v1]  │  │ [Export]   │  │   │
│  │  └────────────────┘  └────────────┘  └────────────┘  │   │
│  │                                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Overview

```
┌──────────────────────────┐
│ Meeting                  │
├──────────────────────────┤
│ _id                      │
│ title                    │
│ description              │
│ scheduledAt              │
│ participants: [User]     │
│ createdBy: User          │
│ processingStatus         │
│ audioFileUrl             │
│ transcript[]             │
│ summary                  │
│ actionItems[]            │
│ createdAt, updatedAt     │
└──────────┬───────────────┘
           │ 1:1 relationship
           ↓
┌──────────────────────────┐
│ MOM                      │  ← Frontend reads/writes here
├──────────────────────────┤
│ _id                      │
│ meetingId (unique)       │
│ title                    │
│ attendees[]              │
│ ├─ userId → User._id    │
│ ├─ name                  │
│ ├─ role                  │
│ ├─ speakingDuration     │
│ └─ turnsTaken            │
│ summary                  │
│ keyPoints[]              │
│ ├─ id (UUID)             │
│ ├─ source: 'ai'/'manual' │
│ ├─ category              │
│ ├─ text                  │
│ ├─ speaker               │
│ ├─ timestamp             │
│ ├─ relatedTaskIds[]     │
│ └─ citations[]           │
│ draftActionItems[]       │
│ ├─ id                    │
│ ├─ source: 'ai'/'manual' │
│ ├─ task                  │
│ ├─ assignee              │
│ ├─ assigneeUserId       │
│ ├─ dueDate               │
│ ├─ priority              │
│ ├─ status                │
│ ├─ requiredSkills[]      │
│ ├─ relatedDecisions[]   │
│ └─ citations[]           │
│ source: 'ai'/'manual'    │
│ version                  │
│ metrics{...}             │
│ createdAt, updatedAt     │
└──────────┬───────────────┘
           │ 1:N relationship (edit history)
           ↓
┌──────────────────────────────┐
│ ReviewVersion                │  ← Tracks all edits
├──────────────────────────────┤
│ _id                          │
│ meetingId                    │
│ version (per meeting)        │
│ reviewedBy → User._id        │
│ fields[]:                    │
│ ├─ field: 'summary'/'...     │
│ ├─ source: 'ai'/'manual'     │
│ ├─ original: "AI value"      │
│ ├─ edited: "Reviewer value"  │
│ └─ diff[]:                   │
│    ├─ op: 'unchanged'/'added'/'removed'
│    └─ value: "text snippet"  │
│ locked: boolean              │
│ lockedAt, lockedBy           │
│ createdAt, updatedAt         │
└──────────────────────────────┘
```

---

## Frontend State Management

```
MomEditor Component
├── State:
│   ├── mom: IMomJSON | null
│   │   ├── attendees[]
│   │   ├── summary: string
│   │   ├── keyPoints[]
│   │   └── draftActionItems[]
│   │
│   ├── editedMom: IMomJSON | null (working copy during edit)
│   │
│   ├── reviewVersion: IReviewVersion | null
│   │   ├── version: number
│   │   ├── locked: boolean
│   │   └── reviewedBy: string
│   │
│   ├── isEditing: boolean
│   ├── isSaving: boolean
│   ├── error: string | null
│   └── toast: { message, type } | null
│
├── Effects:
│   ├── useEffect(() => fetchMom(), [meetingId])
│   └── useEffect(() => setEditedMom(mom), [mom])
│
└── Handlers:
    ├── handleEdit(field, value) → setEditedMom
    ├── handleAddKeyPoint() → append to editedMom.keyPoints
    ├── handleDeleteKeyPoint(id) → filter from editedMom.keyPoints
    ├── handleAddActionItem() → append to editedMom.draftActionItems
    ├── handleDeleteActionItem(id) → filter
    ├── handleSave() → PATCH /api/meetings/:id/mom
    ├── handleLock() → POST /api/meetings/:id/mom/lock
    └── handleCancel() → reset editedMom to mom
```

---

## API Call Sequence Diagram

```
Frontend                          Backend                       Database
   │                                  │                              │
   │ 1. GET /meetings/:id/mom         │                              │
   ├─────────────────────────────────→│                              │
   │                                  │ Query Meeting                │
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │                                  │ Query Mom                    │
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │                                  │ Query latest ReviewVersion   │
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │ Response: {mom, reviewVersion}   │                              │
   │←─────────────────────────────────┤                              │
   │ Display MOM editor               │                              │
   │                                  │                              │
   │ User edits + clicks Save         │                              │
   │                                  │                              │
   │ 2. PATCH /meetings/:id/mom       │                              │
   ├─────────────────────────────────→│                              │
   │    {summary, keyPoints, ...}     │                              │
   │                                  │ Update Mom                   │
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │                                  │ Increment Mom.version        │
   │                                  │ Create ReviewVersion         │
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │ Response: {mom, version}         │                              │
   │←─────────────────────────────────┤                              │
   │ Show toast: "Saved (v2)"         │                              │
   │ Update UI state                  │                              │
   │                                  │                              │
   │ Admin clicks Lock                │                              │
   │                                  │                              │
   │ 3. POST /meetings/:id/mom/lock   │                              │
   ├─────────────────────────────────→│                              │
   │                                  │ Set ReviewVersion.locked=true│
   │                                  ├─────────────────────────────→│
   │                                  │←─────────────────────────────┤
   │ Response: {lockedAt}             │                              │
   │←─────────────────────────────────┤                              │
   │ Disable all edit buttons         │                              │
   │ Show lock icon                   │                              │
```

---

**Legend:**
- `→` API Request
- `←` API Response
- `├→` Database Query
- `←┤` Query Result
