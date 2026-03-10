import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/documents/[id]/duplicate — copy document and its grantors/grantees. formData: newDocNumber (optional; if missing, appends -copy). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  const formData = await req.formData();
  let newDocNumber = (formData.get("newDocNumber") as string)?.trim();
  try {
    const doc = await prisma.universaDocument.findUnique({
      where: { id },
      include: { grantors: true, grantees: true },
    });
    if (!doc) return NextResponse.redirect(new URL("/admin/documents?error=notfound", req.nextUrl.origin));
    if (!newDocNumber) newDocNumber = doc.docNumber + "-copy";
    const created = await prisma.universaDocument.create({
      data: {
        docNumber: newDocNumber,
        documentNumberAlt: doc.documentNumberAlt,
        recordedAt: doc.recordedAt,
        documentTitle: doc.documentTitle ? doc.documentTitle + " (copy)" : "(copy)",
        recReqBy: doc.recReqBy,
        sendTo: doc.sendTo,
        sendAdrs: doc.sendAdrs,
        sendAdrs2: doc.sendAdrs2,
        sendTaxTo: doc.sendTaxTo,
        sendTaxAdrs: doc.sendTaxAdrs,
        sendTaxAdrs2: doc.sendTaxAdrs2,
        considerationAmt: doc.considerationAmt,
        considerationOther: doc.considerationOther,
        propertyCounty: doc.propertyCounty,
        lot: doc.lot,
        block: doc.block,
        tract: doc.tract,
        book: doc.book,
        pages: doc.pages,
        parcelNumber: doc.parcelNumber,
        propertyAdrs: doc.propertyAdrs,
        propertyAdrs2: doc.propertyAdrs2,
        propertyAdrs3: doc.propertyAdrs3,
        notaryName: doc.notaryName,
        notarizationDate: doc.notarizationDate,
        comments: doc.comments,
        signedBy: doc.signedBy,
        signerTitle: doc.signerTitle,
        dateSigned: doc.dateSigned,
        signedBy2: doc.signedBy2,
        signer2Title: doc.signer2Title,
        signedBy3: doc.signedBy3,
        signer3Title: doc.signer3Title,
        numberOfPages: doc.numberOfPages,
      },
    });
    for (const g of doc.grantors) {
      await prisma.universaDocumentGrantor.create({
        data: {
          documentId: created.id,
          grantorNumber: g.grantorNumber,
          name: g.name,
          address: g.address,
          address2: g.address2,
          address3: g.address3,
          percentShare: g.percentShare,
          comment: g.comment,
        },
      });
    }
    for (const g of doc.grantees) {
      await prisma.universaDocumentGrantee.create({
        data: {
          documentId: created.id,
          granteeNumber: g.granteeNumber,
          name: g.name,
          address: g.address,
          address2: g.address2,
          address3: g.address3,
          percentShare: g.percentShare,
          comment: g.comment,
        },
      });
    }
    return NextResponse.redirect(new URL("/admin/documents/" + created.id + "/edit", req.nextUrl.origin));
  } catch (e: unknown) {
    const isUnique = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002";
    return NextResponse.redirect(new URL("/admin/documents/" + id + "/edit?error=" + (isUnique ? "duplicate" : "copy"), req.nextUrl.origin));
  }
}
