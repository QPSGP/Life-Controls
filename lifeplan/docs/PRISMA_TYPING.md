# Prisma + TypeScript: Avoid "Property does not exist" on build

When a page uses **try/catch** and initializes a variable as an empty array, then assigns a Prisma `findMany` result that uses **`include`** (relations), TypeScript can infer the wrong type and the **production build** will fail with:

```text
Type error: Property 'member' does not exist on type '{ id: string; ... }'. Did you mean 'memberId'?
```

## Why it happens

- `let items: Awaited<ReturnType<typeof prisma.model.findMany>> = []` uses the **default** `findMany` type, which does **not** include relations.
- Your actual call is `prisma.model.findMany({ include: { member: true } })`, so at runtime `items[i].member` exists, but the type does not.

## Fix (do this from the start)

**Do not** type the variable as `Awaited<ReturnType<typeof prisma.X.findMany>>` when the query uses `include`.

**Do** define an explicit type that matches the query result (base fields + included relations), then assign the query result to that variable:

```ts
// 1. Define a type that includes the relations you use
type OrderWithMemberAndLines = {
  id: string;
  memberId: string;
  // ...other Order fields
  member: { id: string; email: string; firstName: string | null; lastName: string | null };
  orderLines: { id: string; item: string | null; quantity: number; totalCents: number; /* ... */ }[];
};

// 2. Type the variable and assign in try block
let orders: OrderWithMemberAndLines[] = [];
try {
  const data = await prisma.order.findMany({
    include: {
      member: { select: { id: true, email: true, firstName: true, lastName: true } },
      orderLines: true,
    },
  });
  orders = data;
} catch (e) {
  // ...
}
```

## Pages that use explicit types (try/catch + Prisma)

- **app/admin/(protected)/orders/page.tsx** — `OrderWithMemberAndLines[]` (query uses `include: { member, orderLines }`)
- **app/admin/(protected)/expenditures/page.tsx** — `ExpenditureWithMember[]` (query uses `include: { member }`)
- **app/admin/(protected)/chores/page.tsx** — `Chore[]` from `@prisma/client` (no include; avoids fragile `Awaited<ReturnType<...>>`)

Pages that **don’t** use try/catch with an empty initial array (e.g. direct `const [a, b] = await Promise.all([...])`) get the correct type from the query and don’t need this.

## Checklist for new admin pages

1. If the page has **try/catch** and initializes **`let x = []`** before a Prisma query that uses **`include`**, type `x` explicitly (e.g. `XWithRelation[]`) and assign the query result inside the try block.
2. Run **`npm run build`** before pushing so type errors are caught locally and in CI.
