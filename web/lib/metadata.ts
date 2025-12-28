import stringify from "json-stable-stringify";
import type { CreateCertificateInput } from "./validation";

export type CertificateMetadata = {
  type: string;
  name: string;
  specialization: string;
  recipient: string;
  issuedBy: string;
  issuedDate: string;
  student: { id: string; name: string };
};

export function buildMetadata(input: CreateCertificateInput): CertificateMetadata {
  return {
    type: input.type,
    name: input.name,
    specialization: input.specialization,
    recipient: input.recipient,
    issuedBy: input.issuedBy,
    issuedDate: input.issuedDate,
    student: input.student
  };
}

export function canonicalizeMetadata(metadata: CertificateMetadata): string {
  return stringify(metadata) as string;
}
