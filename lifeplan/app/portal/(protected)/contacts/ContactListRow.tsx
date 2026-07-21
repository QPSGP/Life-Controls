import Link from "next/link";
import { contactDisplayName } from "@/lib/crm";
import { allEmails, allPhones, phoneDigits } from "@/lib/crm-channels";
import { letterBucket, sortNameForContact } from "@/lib/crm-contact-query";

type ContactRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  emailSecondary?: string | null;
  phone: string | null;
  mobile: string | null;
  fax?: string | null;
  channels?: unknown;
  jobTitle: string | null;
  companyName: string | null;
  category: string;
  visibility: string;
  company?: { id: string; name: string | null } | null;
};

export function ContactListRow({
  contact,
  href,
  showLetterHeader,
  previousSortName,
}: {
  contact: ContactRow;
  href: string;
  showLetterHeader?: boolean;
  previousSortName?: string;
}) {
  const sortName = sortNameForContact(contact);
  const bucket = letterBucket(sortName);
  const prevBucket = previousSortName ? letterBucket(previousSortName) : null;
  const showHeader = showLetterHeader && bucket !== prevBucket;

  const phones = allPhones(contact);
  const emails = allEmails(contact);
  const phone = phones[0];
  const email = emails[0];
  const smsDigits = phone ? phoneDigits(phone) : "";

  return (
    <>
      {showHeader && (
        <li className="pt-3 pb-1 sticky top-0 z-[1] bg-neutral-950/95 backdrop-blur-sm">
          <p id={`letter-${bucket}`} className="text-xs font-semibold text-emerald-500 tracking-wider px-1">
            {bucket}
          </p>
        </li>
      )}
      <li>
        <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
          <Link href={href} className="block p-4 hover:bg-neutral-800/80">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">{contactDisplayName(contact)}</span>
              <span className="text-xs text-neutral-500 capitalize shrink-0">{contact.category}</span>
            </div>
            {contact.jobTitle && <p className="text-neutral-400 text-sm mt-0.5">{contact.jobTitle}</p>}
            {(contact.company?.name || contact.companyName) && (
              <p className="text-neutral-500 text-sm">{contact.company?.name || contact.companyName}</p>
            )}
            {(email || phone) && (
              <p className="text-neutral-500 text-sm mt-1">{[email, phone].filter(Boolean).join(" · ")}</p>
            )}
          </Link>
          {(phone || email) && (
            <div className="flex border-t border-neutral-800 divide-x divide-neutral-800">
              {phone && (
                <a href={`tel:${phone}`} className="flex-1 text-center py-2.5 text-sm text-emerald-400 hover:bg-neutral-800">
                  Call
                </a>
              )}
              {smsDigits && (
                <a href={`sms:${smsDigits}`} className="flex-1 text-center py-2.5 text-sm text-sky-400 hover:bg-neutral-800">
                  Text
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex-1 text-center py-2.5 text-sm text-violet-400 hover:bg-neutral-800">
                  Email
                </a>
              )}
            </div>
          )}
        </div>
      </li>
    </>
  );
}
