import { keccak256Utf8 } from "@/lib/hash";
import { buildMetadata, canonicalizeMetadata } from "@/lib/metadata";
import { pinata } from "@/lib/pinata";
import { CreateCertificateSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateCertificateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const metadata = buildMetadata(parsed.data);
    const canonicalJson = canonicalizeMetadata(metadata);
    const metadataHash = keccak256Utf8(canonicalJson);

    const { cid } = await pinata.upload.public.json(JSON.parse(canonicalJson) as object)
    const url = await pinata.gateways.public.convert(cid);

    return NextResponse.json({
      ok: true,
      recipient: parsed.data.recipient,
      tokenURI: url,
      metadataHash,
      metadataCid: cid,
      canonicalJson, // keep for debugging
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { ok: false, error: "PREPARE_FAILED", message: err.message },
        { status: 500 }
      );
    }
  }
}
