import { z } from "zod";
import { isAddress } from "viem";

export const CreateCertificateSchema = z.object({
    type: z.string().min(1, "type is required"),
    name: z.string().min(1, "name is required"),
    specialization: z.string().min(1, "specialization is required"),
    recipient: z.string().refine((v) => isAddress(v), "Invalid recipient address"),
    issuedBy: z.string().min(1, "issuedBy is required"),
    issuedDate: z.string().min(1, "issuedDate is required"),
    student: z
        .object({
            id: z.string().min(1, "student.id is required"),
            name: z.string().min(1, "student.name is required"),
        })
});

export type CreateCertificateInput = z.infer<typeof CreateCertificateSchema>;
