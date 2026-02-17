# Life Plan — Table Structure

The Life Plan uses a **one-to-many hierarchy** from User down to Physical movements.

---

## Hierarchy (one → many at each level)

```
User (staff)
  └── Subject/Business   (one-to-many)
        └── Area of Purpose   (one-to-many)
              └── Area of Responsibility   (one-to-many)
                    └── Physical movement   (one-to-many)
```

---

## Tables

| Table | Parent | Purpose |
|-------|--------|---------|
| **users** | — | Staff user (admin/agent). Top of the life plan tree. |
| **subject_business** | users | Subject/Business: **name** (label) + sentence structure **verb, noun, object, objective**. Optional link to **members** for portal. |
| **area_of_purpose** | subject_business | Area of purpose: **name** + **verb, noun, object, objective**. |
| **area_of_responsibility** | area_of_purpose | Area of responsibility: **name** + **verb, noun, object, objective**. |
| **physical_movement** | area_of_responsibility | Physical movement / task: **verb, noun, object**, objective, results, done, doneAt. |

---

## Relations

- **User** → has many **SubjectBusiness**
- **SubjectBusiness** → has many **AreaOfPurpose**; optionally belongs to one **Member**
- **AreaOfPurpose** → has many **AreaOfResponsibility**
- **AreaOfResponsibility** → has many **PhysicalMovement**

---

## Applying the schema

After pulling this schema, run **DB push** (or the “DB push and seed” workflow) once so the new tables exist:

- `subject_business`
- `area_of_purpose`
- `area_of_responsibility`
- `physical_movement`

UI to create and edit this hierarchy (admin and/or member portal) can be added next.
