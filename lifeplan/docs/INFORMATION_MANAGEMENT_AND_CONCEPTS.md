# Information Management & Concept Reference

**Purpose:** A single place to gather and reference the concepts that structure this project—especially Neo-Think and mini-day scheduling—so the business and the app stay aligned. You can paste or type excerpts from your materials here.

---

## What this doc is for

- **Capture concepts** from Neo-Tech Business Control / Neo-Think (and related) so they’re not only in the book.
- **Align vocabulary** between the book and the app (Subject/Business, Area of Purpose, Physical Movement, miniday, etc.).
- **Support information-management tools** the business uses to run the system.

**Note:** The AI cannot read your physical book or PDF. Add key definitions and process descriptions below (or in linked files) so they’re in the repo and usable for future work.

---

## Neo-Think and Mini-Day: Concepts (to fill from your materials)

### Mini-day schedule (concept)

- **Idea:** Structure the day around discrete, scheduled “physical movements” (actions) rather than a loose to-do list. Each movement has a type (e.g. Go To, Read, Write, Call), a time/date or rollover, and sits under Purpose and Responsibility.
- **In this app:** The portal “My miniday schedule” shows the member’s physical movements **grouped by movement type** (Go To, Read, Think, Write, Call, Operation, Arithmetic, Design/Art, Health). Each row is Subject → Area of Purpose → Area of Responsibility → activity (verb/noun/object) and objective; DATE/TIME and D/R (date-specific vs rollover) are in the data model and admin.

*Add from your book: definitions of “miniday,” how the mini-day relates to the life plan, and any rules for scheduling or rollover.*

---

### Physical movement (concept)

- **Idea:** A concrete, schedulable unit of work—something you “do” (go somewhere, read something, write, call, operate, etc.) tied to an area of responsibility and purpose.
- **In this app:** Stored as `PhysicalMovement`: verb, noun, object, objective, results; `scheduledDate`, `scheduledTime`, `dateOrRollover` (D/R); `movementType`; done/doneAt; sortOrder. Sentence structure (verb, noun, object, objective) appears at every level (Subject, Purpose, Responsibility, Movement).

*Add from your book: definition of “physical movement,” how it differs from a goal or project, and how it fits the hierarchy.*

---

### Hierarchy: Subject/Business → Purpose → Responsibility → Movement

- **Idea:** Control and clarity come from a clear hierarchy: what domain (Subject/Business), what purpose within it, what responsibility, then what specific movements.
- **In this app:** User → SubjectBusiness → AreaOfPurpose → AreaOfResponsibility → PhysicalMovement. Optional link from SubjectBusiness to Member so a member sees “My plan” and “My miniday schedule” in the portal.

*Add from your book: definitions of Subject/Business, Area of Purpose, Area of Responsibility, and how they’re used for information management and control.*

---

### Movement types (miniday categories)

- **In this app (canonical list):** Go To, Read, Think, Write, Call, Operation, Arithmetic, Design/Art, Health. Used to group the miniday schedule and reports.
- **From your materials:** If the book uses different or additional types, list them here so we can align the app (e.g. add to `lib/movement-types.ts` or document why we diverge).

---

### Date / Time / D-R (Date vs Rollover)

- **Idea:** Some movements are for a specific date/time; others “roll over” until done.
- **In this app:** `scheduledDate`, `scheduledTime`, `dateOrRollover` on `PhysicalMovement`; admin and reports show DATE, TIME, D/R; portal shows the schedule by type.

*Add from your book: rules for when to use date-specific vs rollover, and how rollover is processed.*

---

## Where this lives in the codebase

| Concept            | App location |
|--------------------|--------------|
| Miniday schedule   | `app/portal/(protected)/schedule/page.tsx` — “My miniday schedule” by movement type |
| Movement types     | `lib/movement-types.ts` — `MOVEMENT_TYPES`, `MOVEMENT_TYPE_ORDER` |
| Hierarchy + PM     | `prisma/schema.prisma` — User, SubjectBusiness, AreaOfPurpose, AreaOfResponsibility, PhysicalMovement |
| Plan view          | `app/portal/(protected)/plan/` — “My plan”; link to “Miniday schedule” |
| Admin create/edit  | `app/admin/life-plan/` — Subject, Purpose, Responsibility, Movement (with Type, DATE, TIME, D/R) |
| Reports            | `app/admin/reports/` — CSV + “View on screen” by type |

---

## Extracts from your materials (paste below)

Use this section to paste or type short excerpts from Neo-Tech Business Control or Neo-Think that define terms, rules, or processes. That way the concepts are in version control and the AI can use them.

### Definitions

*(Paste definitions of: miniday, physical movement, Subject/Business, Area of Purpose, Area of Responsibility, and any other key terms.)*

---

### Mini-day and scheduling rules

*(Paste rules for how to build and use the mini-day, when to use D vs R, and how movements are ordered or prioritized.)*

---

### Information management / business control

*(Paste any principles or procedures for gathering, organizing, and using information in the business.)*

---

## Changelog

- **Added:** Initial information-management and concept reference; placeholders for Neo-Think and mini-day aligned to current app behavior.
