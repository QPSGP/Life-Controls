import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/universa/documents/[id] — get one document with grantors and grantees */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const doc = await prisma.universaDocument.findUnique({
      where: { id },
      include: { grantors: true, grantees: true },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...doc,
      recordedAt: doc.recordedAt?.toISOString() ?? null,
      notarizationDate: doc.notarizationDate?.toISOString() ?? null,
      dateSigned: doc.dateSigned?.toISOString() ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

/** POST /api/universa/documents/[id] — update document (formData) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  const formData = await req.formData();
  const get = (k: string) => (formData.get(k) as string)?.trim() || null;
  const getDate = (k: string) => {
    const s = get(k);
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  try {
    await prisma.universaDocument.update({
      where: { id },
      data: {
        documentTitle: get("documentTitle"),
        documentNumberAlt: get("documentNumberAlt"),
        recordedAt: getDate("recordedAt"),
        dateSigned: getDate("dateSigned"),
        notarizationDate: getDate("notarizationDate"),
        recReqBy: get("recReqBy"),
        sendTo: get("sendTo"),
        sendAdrs: get("sendAdrs"),
        sendAdrs2: get("sendAdrs2"),
        sendTaxTo: get("sendTaxTo"),
        sendTaxAdrs: get("sendTaxAdrs"),
        sendTaxAdrs2: get("sendTaxAdrs2"),
        considerationAmt: get("considerationAmt"),
        considerationOther: get("considerationOther"),
        propertyCounty: get("propertyCounty"),
        lot: get("lot"),
        block: get("block"),
        tract: get("tract"),
        book: get("book"),
        pages: get("pages"),
        parcelNumber: get("parcelNumber"),
        propertyAdrs: get("propertyAdrs"),
        propertyAdrs2: get("propertyAdrs2"),
        propertyAdrs3: get("propertyAdrs3"),
        notaryName: get("notaryName"),
        comments: get("comments"),
        signedBy: get("signedBy"),
        signerTitle: get("signerTitle"),
        signedBy2: get("signedBy2"),
        signer2Title: get("signer2Title"),
        signedBy3: get("signedBy3"),
        signer3Title: get("signer3Title"),
        numberOfPages: formData.get("numberOfPages") ? parseInt(String(formData.get("numberOfPages")), 10) || null : null,
      },
    });
    return NextResponse.redirect(new URL("/admin/documents/" + id + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/documents/" + id + "/edit?error=update", req.nextUrl.origin));
  }
}
