# Contacts & Companies — HubSpot-style design

**Goal:** Build databases and profiles about people and companies (not just contact info) so you can understand and engage with them. Support **private vs public** and **business vs personal** separation.

**Important:** This **adds** contact/company management. It does **not** remove or replace any existing parts of the Sovereign Life Control Tool (life plan, members, subscriptions, documents, UNIVERSA, reports, communications, etc.). Those stay as-is; this is to **further manage contacts** on top of what you already have.

---

## Relationship to existing features (nothing is lost)

| Existing | Stays as-is | New layer (Contacts & Companies) |
|----------|-------------|-----------------------------------|
| **Members** | Subscribers; profile, subscriptions, portal. | Unchanged. Contacts/Companies are *owned by* a member (their personal/team contact DB). |
| **Life plan** | Subjects, purposes, responsibilities, physical movements, miniday, Live PM. | Unchanged. |
| **Documents (UNIVERSA)** | Documents, grantors, grantees, People (UniversaPerson for legal/recording context). | Unchanged. UNIVERSA People stay for document workflow; Contacts are for general relationship/CRM. |
| **Communications** | Log call/mailout/email per member (existing list and form). | Optional **link** to a Contact and/or Company (contactId, companyId) so activities show on contact/company profiles. memberId and existing behavior unchanged. |
| **Reports, Invoices, Orders, etc.** | All unchanged. | — |

So: **core product stays intact**; we add a **Contacts & Companies** layer to further manage contacts (profiles, private/public, business/personal, timeline).

---

## 1. Two entity types (like HubSpot)

| Entity | Purpose |
|--------|--------|
| **Contact** | A **person**. Contact info + rich profile (notes, how to engage, preferences, key facts). Can be linked to a Company. |
| **Company** | An **organization**. Company info + profile (industry, size, key people, notes). Contacts can belong to a company. |

- Each **Contact** and **Company** is owned by a **Member** (the person building their own database).
- Optional: **Contact.companyId** → Company, so “John at Acme Corp” links John (Contact) to Acme (Company).

---

## 2. Private vs public

| Value | Meaning |
|-------|--------|
| **private** | Only the owner (the member who created it) can see and edit it. |
| **public** | Visible to others you choose (e.g. team, admin). For single-user accounts this can mean “shareable” or “not hidden”; later you can add teams and “public = visible to my team.” |

- Field: **`visibility: 'private' | 'public'`** on both Contact and Company.
- Portal: members see only their own contacts/companies; filter by visibility when you add sharing.
- Admin: can see “all” for support, or filter by member.

---

## 3. Business vs personal

| Value | Meaning |
|-------|--------|
| **business** | Work-related contacts/companies (clients, partners, vendors). |
| **personal** | Personal relationships (family, friends, personal providers). |

- Field: **`category: 'business' | 'personal'`** on both Contact and Company.
- Enables: “My business contacts,” “My personal contacts,” “Business companies only,” etc.
- UI: tabs or filters: Business | Personal | All.

---

## 4. Profile data (beyond contact info)

**Contact (person)**  
- **Contact info:** First name, Last name, display name, email(s), phone(s), mobile, fax, job title, company name (text), address.  
- **Profile / “understand & engage”:**  
  - Notes (rich or long text)  
  - How to engage (e.g. “Prefers email,” “Best time: mornings”)  
  - Key facts, interests, last topic discussed  
  - Tags (e.g. VIP, Prospect, Partner)  
  - Source (Outlook, RingCentral, Manual, Import)  
- **Link:** Optional `companyId` → Company.

**Company (organization)**  
- **Basic:** Name, website, phone, address, industry, size (e.g. SMB, Enterprise).  
- **Profile:** Notes, key people (text or links to Contacts), strategic notes, tags, source.

So: contact information **plus** a profile section to “understand and engage” the person or company.

---

## 5. Linking communications (emails, calls, correspondence)

- **Communication** today: `memberId`, type (call, mailout, email), subject, notes.
- Add **optional** `contactId` and `companyId` on Communication.
- When logging a call/email/correspondence, user can pick a **Contact** (and optionally a **Company**). That links the activity to the contact/company.
- **Contact detail page:** Timeline of all communications with that contact (and with that company if linked).
- **Company detail page:** Timeline of communications linked to that company (and list of linked contacts).

Result: one place to see “everything we know and everything we’ve done” with that person or company.

---

## 6. Where it lives (portal vs admin)

| Area | Who | What |
|------|-----|------|
| **Portal** | Member (subscriber) | **My Contacts** and **My Companies** — the member’s own private/public, business/personal databases. Add, edit, view profiles, log communications linked to contacts/companies. |
| **Admin** | Staff | **Contacts** and **Companies** — list/filter by member, visibility, category; view or edit for support; optional “as member” to manage on behalf of a member. |

So the **individual** builds their own contact/company databases in the portal; admin can oversee or help.

---

## 7. Import (Outlook, RingCentral, etc.)

- **CSV import** (first step): Map columns (First Name, Last Name, Email, Company, Phone, etc.) to Contact/Company. Presets: “Outlook CSV,” “RingCentral CSV.”
- **Category/visibility:** On import, set default category (business/personal) and visibility (private).
- **API sync** (later): Outlook (Microsoft Graph), RingCentral — same profile model, sync into Contact/Company.

---

## 8. Suggested schema (high level)

- **Contact:** memberId, visibility, category, first/last/display name, emails, phones, job title, company name (text), address, notes, howToEngage, tags, source, companyId (optional FK to Company), timestamps.
- **Company:** memberId, visibility, category, name, website, phone, address, industry, size, notes, tags, source, timestamps.
- **Communication:** add contactId (optional), companyId (optional); keep memberId.

---

## 9. Implementation order

| Phase | What |
|-------|------|
| **1** | Schema: Contact and Company models (with visibility, category, profile fields). Communication: add contactId, companyId. |
| **2** | Portal: My Contacts / My Companies — list (filter by business/personal, private/public), add, edit, view profile. |
| **3** | Link communications: when logging a call/email, optional “Link to contact/company”; contact/company detail page shows timeline. |
| **4** | Admin: Contacts and Companies list (filter by member, category, visibility); view/edit for support. |
| **5** | CSV import for Contacts (and Companies) with column mapping / Outlook-style preset. |
| **6** | Optional: API sync (Outlook, RingCentral). |

This gives you a HubSpot-like hub: contact and company **profiles** (not just contact info), **private/public** and **business/personal** separation, and communications tied to contacts/companies so you can understand and engage with people and companies in one place.
