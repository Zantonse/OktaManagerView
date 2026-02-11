import { describe, it, expect } from 'vitest';
import {
  ptoAssignmentSchema,
  certificationDecisionSchema,
  createDelegateSchema,
  accessRequestUpdateSchema,
  userLifecycleActionSchema,
  type PTOAssignmentInput,
  type CertificationDecisionInput,
  type CreateDelegateInput,
  type AccessRequestUpdateInput,
  type UserLifecycleActionInput,
} from '@/lib/validations/okta';
import { ZodError } from 'zod';

describe('Okta Validation Schemas', () => {
  describe('ptoAssignmentSchema', () => {
    it('should validate correct PTO assignment', () => {
      const validInput: PTOAssignmentInput = {
        ptoStartDate: '2024-12-20',
        ptoEndDate: '2024-12-27',
        delegateId: 'usr123',
        note: 'On vacation',
      };

      const result = ptoAssignmentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate PTO assignment without optional note', () => {
      const validInput = {
        ptoStartDate: '2024-12-20',
        ptoEndDate: '2024-12-27',
        delegateId: 'usr123',
      };

      const result = ptoAssignmentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format for ptoStartDate', () => {
      const invalidInput = {
        ptoStartDate: '12/20/2024', // Wrong format
        ptoEndDate: '2024-12-27',
        delegateId: 'usr123',
      };

      const result = ptoAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
      }
    });

    it('should reject invalid date format for ptoEndDate', () => {
      const invalidInput = {
        ptoStartDate: '2024-12-20',
        ptoEndDate: '27-12-2024', // Wrong format
        delegateId: 'usr123',
      };

      const result = ptoAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
      }
    });

    it('should reject empty delegateId', () => {
      const invalidInput = {
        ptoStartDate: '2024-12-20',
        ptoEndDate: '2024-12-27',
        delegateId: '',
      };

      const result = ptoAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject missing required fields', () => {
      const incompleteInput = {
        ptoStartDate: '2024-12-20',
        // Missing ptoEndDate and delegateId
      };

      expect(() => ptoAssignmentSchema.parse(incompleteInput)).toThrow(ZodError);
    });
  });

  describe('certificationDecisionSchema', () => {
    it('should validate APPROVE decision', () => {
      const validInput: CertificationDecisionInput = {
        campaignId: 'camp001',
        certificationId: 'cert001',
        decision: 'APPROVE',
        justification: 'User still requires this access',
      };

      const result = certificationDecisionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate REVOKE decision', () => {
      const validInput: CertificationDecisionInput = {
        campaignId: 'camp001',
        certificationId: 'cert001',
        decision: 'REVOKE',
      };

      const result = certificationDecisionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid decision value', () => {
      const invalidInput = {
        campaignId: 'camp001',
        certificationId: 'cert001',
        decision: 'MAYBE',
      };

      const result = certificationDecisionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty campaignId', () => {
      const invalidInput = {
        campaignId: '',
        certificationId: 'cert001',
        decision: 'APPROVE',
      };

      const result = certificationDecisionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty certificationId', () => {
      const invalidInput = {
        campaignId: 'camp001',
        certificationId: '',
        decision: 'APPROVE',
      };

      const result = certificationDecisionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept optional justification', () => {
      const validInput = {
        campaignId: 'camp001',
        certificationId: 'cert001',
        decision: 'APPROVE',
      };

      const result = certificationDecisionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('createDelegateSchema', () => {
    it('should validate correct delegate creation', () => {
      const validInput: CreateDelegateInput = {
        delegateId: 'usr123',
        scope: ['reviews', 'requests'],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate single scope value', () => {
      const validInput: CreateDelegateInput = {
        delegateId: 'usr123',
        scope: ['reviews'],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty scope array', () => {
      const invalidInput = {
        delegateId: 'usr123',
        scope: [],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid ISO 8601 date format in startDate', () => {
      const invalidInput = {
        delegateId: 'usr123',
        scope: ['reviews'],
        startDate: '2024-12-20', // Missing time
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO 8601');
      }
    });

    it('should reject invalid ISO 8601 date format in endDate', () => {
      const invalidInput = {
        delegateId: 'usr123',
        scope: ['reviews'],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59', // Missing Z
      };

      const result = createDelegateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty delegateId', () => {
      const invalidInput = {
        delegateId: '',
        scope: ['reviews'],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty scope strings in array', () => {
      const invalidInput = {
        delegateId: 'usr123',
        scope: [''],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };

      const result = createDelegateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('accessRequestUpdateSchema', () => {
    it('should validate APPROVED status', () => {
      const validInput: AccessRequestUpdateInput = {
        status: 'APPROVED',
        comment: 'Approved for production access',
      };

      const result = accessRequestUpdateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate DENIED status', () => {
      const validInput: AccessRequestUpdateInput = {
        status: 'DENIED',
        comment: 'Access not required for current role',
      };

      const result = accessRequestUpdateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate without optional comment', () => {
      const validInput = {
        status: 'APPROVED',
      };

      const result = accessRequestUpdateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status value', () => {
      const invalidInput = {
        status: 'PENDING',
        comment: 'Cannot update to PENDING',
      };

      const result = accessRequestUpdateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const invalidInput = {
        comment: 'No status provided',
      };

      expect(() => accessRequestUpdateSchema.parse(invalidInput)).toThrow(ZodError);
    });
  });

  describe('userLifecycleActionSchema', () => {
    it('should validate suspend action', () => {
      const validInput: UserLifecycleActionInput = {
        action: 'suspend',
      };

      const result = userLifecycleActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate unsuspend action', () => {
      const validInput: UserLifecycleActionInput = {
        action: 'unsuspend',
      };

      const result = userLifecycleActionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const invalidInput = {
        action: 'deactivate',
      };

      const result = userLifecycleActionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('suspend');
      }
    });

    it('should reject missing action', () => {
      const invalidInput = {};

      expect(() => userLifecycleActionSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should provide helpful error message', () => {
      const invalidInput = {
        action: 'delete',
      };

      const result = userLifecycleActionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(
          /suspend.*unsuspend/
        );
      }
    });
  });

  describe('Type inference', () => {
    it('should properly infer PTOAssignmentInput type', () => {
      const input: PTOAssignmentInput = {
        ptoStartDate: '2024-12-20',
        ptoEndDate: '2024-12-27',
        delegateId: 'usr123',
      };
      expect(input).toBeDefined();
    });

    it('should properly infer CertificationDecisionInput type', () => {
      const input: CertificationDecisionInput = {
        campaignId: 'camp001',
        certificationId: 'cert001',
        decision: 'APPROVE',
      };
      expect(input).toBeDefined();
    });

    it('should properly infer CreateDelegateInput type', () => {
      const input: CreateDelegateInput = {
        delegateId: 'usr123',
        scope: ['reviews'],
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2024-12-27T23:59:59Z',
      };
      expect(input).toBeDefined();
    });

    it('should properly infer AccessRequestUpdateInput type', () => {
      const input: AccessRequestUpdateInput = {
        status: 'APPROVED',
      };
      expect(input).toBeDefined();
    });

    it('should properly infer UserLifecycleActionInput type', () => {
      const input: UserLifecycleActionInput = {
        action: 'suspend',
      };
      expect(input).toBeDefined();
    });
  });
});
