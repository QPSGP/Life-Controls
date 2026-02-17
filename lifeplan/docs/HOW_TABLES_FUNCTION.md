# How the tables function (together and separate)

Reference for how each table works on its own and how it links to others. Use this when building features, debugging, or matching behavior to the old Paradox setup.

---

## 1. Table overview (by function)

| Group | Table (Prisma) | DB name | Purpose |
|-------|----------------|---------|---------|
| **Staff** | User | users | Staff/plan owner. One per admin or agent. Life plans are owned by a User. |
| **Life plan** | SubjectBusiness | subject_business | Top of plan tree. Owned by User; optionally linked to one Member for portal. |
| | AreaOfPurpose | area_of_purpose | Under Subject/Business. |
| | AreaOfResponsibility | area_of_responsibility | Under Area of Purpose. |
| | PhysicalMovement | physical_movement | Under Area of Responsibility. Task with verb/noun/object, done flag. |
| **Contacts** | Member | members | Subscriber/contact. Email required; profile fields optional. |
| | MemberCategory | member_categories | Tags per member (e.g. Personal, MMPE4). Many per Member. |
| **Plans & billing** | SubscriptionPlan | subscription_plans | Product tier (e.g. SOVEREIGN: Personal $25). Seeded; rarely changed. |
| | Subscription | subscriptions | Member is on a plan. Links Member ↔ SubscriptionPlan; status, period. |
| | Order | orders | Order header per Member. |
| | OrderLine | order_lines | Line items on an Order (item, unitCents, quantity). |
| | Invoice | invoices | Bill per Member. amountCents, dueDate, status. |
| | Payment | payments | Payment against an Invoice. Can be fiat or crypto; one per invoice payment. |
| **Communications** | Communication | communications | Logged contact: call/mailout/email per Member. |
| **Other** | Expenditure | expenditures | Expense (optional Member). description, amountCents, date. |
| | Chore | chores | Internal task (title, description, done). No link to Member. |
| **Legacy-style** | MemberPlan | member_plans | Alternate plan link (memberId + text fields). Optional; portal uses SubjectBusiness.memberId. |
| | MemberPlanTask | member_plan_tasks | Tasks under MemberPlan. |

---

## 2. How they work together

### Staff and life plan (one hierarchy)

```
User (1)
  └── SubjectBusiness (many)     [optional: memberId → Member for portal]
        └── AreaOfPurpose (many)
              └── AreaOfResponsibility (many)
                    └── PhysicalMovement (many)
```

- **Together:** One User owns many SubjectBusinesses; each Subject has many Purposes → many Responsibilities → many PhysicalMovements. Deleting a User cascades deletes their whole plan tree. If a Subject has `memberId` set, that Member sees it in the portal as “My plan.”
- **Separate:** User is used only for ownership and (future) staff list. Life plan tables are only for the plan tree; they don’t drive billing.

### Members and categories

- **Together:** Member has many MemberCategories (e.g. Personal, MMPE4). Categories are used to filter the member list and for display. Delete Member → categories go (cascade).
- **Separate:** Member can exist with no categories. Categories are only labels; they don’t affect subscriptions or invoices.

### Subscriptions and plans

- **Together:** SubscriptionPlan is the product (e.g. $25/mo). Subscription links one Member to one Plan (status, currentPeriodEnd). List “active” subscriptions to see who is on which plan. Delete Member → their subscriptions go (cascade).
- **Separate:** SubscriptionPlan rows are mostly static (seed). Subscriptions are the “many” side per member and per plan.

### Orders and order lines

- **Together:** Order belongs to one Member; OrderLine belongs to one Order. Order.totalCents can be computed from lines or stored. Delete Order → its lines go (cascade).
- **Separate:** Orders are independent of Invoices; no FK between them. You can use orders for internal tracking and invoices for billing.

### Invoices and payments

- **Together:** Invoice belongs to one Member. Payment belongs to one Invoice. Balance = invoice.amountCents − sum(payment.amountCents). When sum of payments ≥ amountCents, treat as paid. Delete Invoice → its payments go (cascade).
- **Separate:** Invoices don’t reference Orders or Subscriptions in the schema; link them in app logic if needed (e.g. “this invoice is for order X”).

### Communications

- **Together:** Communication belongs to one Member (who was called/emailed). Used for history and reports. Delete Member → their communications go (cascade).
- **Separate:** Communications don’t reference Invoices or Life Plan; they’re a standalone log per member.

### Expenditures

- **Together:** Expenditure can optionally link to a Member (memberId). If you need “expenses per member,” set memberId; otherwise use null for global/team expenses. Delete Member → SetNull on memberId (expenditure kept, link cleared).
- **Separate:** No link to Invoices or Orders; standalone expense log.

### Chores

- **Together:** Chore has no foreign keys. It’s a flat list (title, description, done). Used for internal to‑dos only.
- **Separate:** Not tied to any other table.

### MemberPlan / MemberPlanTask

- **Together:** MemberPlan belongs to Member; MemberPlanTask belongs to MemberPlan. Alternate way to store “plan” data (text fields). In this app, the main “plan” is SubjectBusiness (+ areas) with optional SubjectBusiness.memberId for portal.
- **Separate:** Can be ignored if you only use SubjectBusiness for life plan and portal.

---

## 3. Key relationships (foreign keys)

| Child table | Parent | FK column | On delete |
|-------------|--------|-----------|-----------|
| SubjectBusiness | User | userId | Cascade |
| SubjectBusiness | Member (optional) | memberId | SetNull |
| AreaOfPurpose | SubjectBusiness | subjectBusinessId | Cascade |
| AreaOfResponsibility | AreaOfPurpose | areaOfPurposeId | Cascade |
| PhysicalMovement | AreaOfResponsibility | areaOfResponsibilityId | Cascade |
| MemberCategory | Member | memberId | Cascade |
| Subscription | Member | memberId | Cascade |
| Subscription | SubscriptionPlan | subscriptionPlanId | — |
| Order | Member | memberId | Cascade |
| OrderLine | Order | orderId | Cascade |
| Invoice | Member | memberId | Cascade |
| Payment | Invoice | invoiceId | Cascade |
| Communication | Member | memberId | Cascade |
| Expenditure | Member (optional) | memberId | SetNull |
| MemberPlan | Member | memberId | Cascade |
| MemberPlanTask | MemberPlan | memberPlanId | Cascade |
| Chore | — | — | — |

---

## 4. How things work separately (by table)

- **User:** Standalone staff record. Only used as owner of SubjectBusiness rows.
- **SubjectBusiness:** Needs a User. Can optionally point to one Member for portal. All other life plan tables hang off this.
- **AreaOfPurpose / AreaOfResponsibility / PhysicalMovement:** Pure hierarchy; no other FKs. Sentence fields (verb, noun, object, objective) at each level.
- **Member:** Central “contact.” Required for categories, subscriptions, orders, invoices, communications; optional for expenditures and for “My plan” (via SubjectBusiness.memberId).
- **MemberCategory:** Only stores memberId + category name; used for filtering and display.
- **SubscriptionPlan:** Reference data. No parent; referenced by Subscription.
- **Subscription:** Joins Member to SubscriptionPlan with status and dates.
- **Order / OrderLine:** Order is a header for a member; lines are items. No direct link to Invoice in schema.
- **Invoice / Payment:** Invoice is a bill for a member; payments reduce balance. No direct link to Order or Subscription in schema.
- **Communication:** One row per contact event; only links to Member.
- **Expenditure:** Optional memberId; can be global (null) or per member.
- **Chore:** No relations; standalone task list.

---

## 5. Summary

- **Life plan:** One tree (User → Subject → Purpose → Responsibility → Movement); optionally show a Subject to a Member via `SubjectBusiness.memberId`.
- **Member-centric:** Member ties together categories, subscriptions, orders, invoices, communications, and optionally expenditures and “My plan.”
- **Billing:** SubscriptionPlan + Subscription for “who is on what plan”; Invoice + Payment for “what they owe and what was paid.” Orders are separate unless you link them in app logic.
- **Standalone:** Chores; Expenditure (if memberId null); and optionally MemberPlan/MemberPlanTask if you don’t use them.

Use this doc alongside `prisma/schema.prisma` and `docs/LIFE_PLAN_TABLE_STRUCTURE.md` when you need to see how tables function together and separately.
