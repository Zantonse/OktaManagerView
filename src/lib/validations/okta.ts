import { z } from "zod";

/**
 * Validation schema for PTO delegate assignment
 * PUT /api/okta/users/[userId]/pto
 */
export const ptoAssignmentSchema = z.object({
  ptoStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ptoStartDate must be in YYYY-MM-DD format"),
  ptoEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ptoEndDate must be in YYYY-MM-DD format"),
  delegateId: z.string().min(1, "delegateId is required"),
  note: z.string().optional(),
});

export type PTOAssignmentInput = z.infer<typeof ptoAssignmentSchema>;

/**
 * Validation schema for certification decision submission
 * POST /api/okta/governance/certifications
 */
export const certificationDecisionSchema = z.object({
  campaignId: z.string().min(1, "campaignId is required"),
  certificationId: z.string().min(1, "certificationId is required"),
  decision: z.enum(["APPROVE", "REVOKE"]),
  justification: z.string().optional(),
});

export type CertificationDecisionInput = z.infer<
  typeof certificationDecisionSchema
>;

/**
 * Validation schema for delegate creation
 * POST /api/okta/governance/delegates
 */
export const createDelegateSchema = z.object({
  delegateId: z.string().min(1, "delegateId is required"),
  scope: z
    .array(z.string().min(1))
    .min(1, "scope must contain at least one element"),
  startDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      "startDate must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)"
    ),
  endDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      "endDate must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)"
    ),
});

export type CreateDelegateInput = z.infer<typeof createDelegateSchema>;

/**
 * Validation schema for access request update
 * PUT /api/okta/governance/requests/[id]
 */
export const accessRequestUpdateSchema = z.object({
  status: z.enum(["APPROVED", "DENIED"]),
  comment: z.string().optional(),
});

export type AccessRequestUpdateInput = z.infer<
  typeof accessRequestUpdateSchema
>;
