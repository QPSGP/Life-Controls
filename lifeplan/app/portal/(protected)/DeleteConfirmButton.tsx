"use client";

export function DeleteConfirmButton({ label = "Delete" }: { label?: string }) {
  return (
    <button
      type="submit"
      className="text-red-400 text-sm hover:text-red-300"
      onClick={(e) => {
        if (!confirm("Delete this record? Linked activity will be unlinked.")) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
