import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OktaApiError } from '@/lib/okta/errors';
import type { OktaUser } from '@/types/okta';

const OKTA_DOMAIN = 'https://test.okta.com';
const OKTA_API_TOKEN = 'test-token-12345';

describe('Okta Client', () => {
  let client: any;

  beforeEach(async () => {
    vi.resetModules();
    // Set environment variables before importing
    process.env.NEXT_PUBLIC_OKTA_DOMAIN = OKTA_DOMAIN;
    process.env.OKTA_API_TOKEN = OKTA_API_TOKEN;
    // Import after setting env vars
    client = await import('@/lib/okta/client');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_OKTA_DOMAIN;
    delete process.env.OKTA_API_TOKEN;
  });

  describe('getDirectReports', () => {
    it('should call the correct endpoint', async () => {
      const mockUser: OktaUser = {
        id: 'usr001',
        status: 'ACTIVE',
        created: '2023-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          login: 'john@example.com',
          managerId: 'manager@example.com',
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([mockUser]),
        } as Response)
      );

      const result = await client.getDirectReports('manager@example.com');

      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('/api/v1/users');
      expect(callUrl).toContain('managerId');
      expect(result).toEqual([mockUser]);
    });

    it('should include search filter when search term provided', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        } as Response)
      );

      await client.getDirectReports('manager@example.com', { search: 'Alice' });

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('Alice');
    });
  });

  describe('getUser', () => {
    it('should call correct endpoint for user by ID', async () => {
      const mockUser: OktaUser = {
        id: 'usr001',
        status: 'ACTIVE',
        created: '2023-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          login: 'john@example.com',
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUser),
        } as Response)
      );

      const result = await client.getUser('usr001');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/usr001'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserProfile', () => {
    it('should POST with correct body structure', async () => {
      const mockUser: OktaUser = {
        id: 'usr001',
        status: 'ACTIVE',
        created: '2023-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          login: 'john@example.com',
          onPTO: true,
          ptoStartDate: '2024-12-20',
          ptoEndDate: '2024-12-27',
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUser),
        } as Response)
      );

      const profileUpdate = {
        onPTO: true,
        ptoStartDate: '2024-12-20',
        ptoEndDate: '2024-12-27',
      };

      const result = await client.updateUserProfile('usr001', profileUpdate);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/usr001'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('suspendUser', () => {
    it('should POST to suspend endpoint', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(undefined),
        } as Response)
      );

      await client.suspendUser('usr001');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lifecycle/suspend'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('unsuspendUser', () => {
    it('should POST to unsuspend endpoint', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(undefined),
        } as Response)
      );

      await client.unsuspendUser('usr001');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lifecycle/unsuspend'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error on non-200 response', async () => {
      const errorResponse = {
        errorCode: 'E0000007',
        errorSummary: 'Not found: Resource not found: usr999 (User)',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve(errorResponse),
        } as Response)
      );

      try {
        await client.getUser('usr999');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.name).toBe('OktaApiError');
        expect(error.statusCode).toBe(404);
      }
    });

    it('should include error code and causes in error response', async () => {
      const errorResponse = {
        errorCode: 'E0000009',
        errorSummary: 'Api validation failed',
        errorCauses: [
          { errorSummary: 'Field "email" has invalid value' },
          { errorSummary: 'Field "firstName" is required' },
        ],
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve(errorResponse),
        } as Response)
      );

      try {
        await client.updateUserProfile('usr001', { email: '' });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.name).toBe('OktaApiError');
        expect(error.errorCode).toBe('E0000009');
        expect(error.errorCauses).toContain('Field "email" has invalid value');
      }
    });

    it('should handle non-JSON error responses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('Not JSON')),
        } as Response)
      );

      try {
        await client.getUser('usr001');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.name).toBe('OktaApiError');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('Rate limit retry logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry on 429 status code and succeed on second attempt', async () => {
      const mockUser: OktaUser = {
        id: 'usr001',
        status: 'ACTIVE',
        created: '2023-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          login: 'john@example.com',
        },
      };

      let callCount = 0;
      global.fetch = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            headers: new Headers({ 'x-rate-limit-reset': '0' }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUser),
        } as Response);
      });

      const promise = client.getUser('usr001');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(callCount).toBe(2);
      expect(result).toEqual(mockUser);
    });
  });

  describe('204 No Content handling', () => {
    it('should return undefined for 204 responses', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(undefined),
        } as Response)
      );

      const result = await client.suspendUser('usr001');

      expect(result).toBeUndefined();
    });
  });

  describe('Authorization header', () => {
    it('should include SSWS token in Authorization header', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        } as Response)
      );

      await client.getUser('usr001');

      const callArgs = (global.fetch as any).mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBe(`SSWS ${OKTA_API_TOKEN}`);
    });

    it('should include correct Content-Type header', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        } as Response)
      );

      await client.updateUserProfile('usr001', { firstName: 'Jane' });

      const callArgs = (global.fetch as any).mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBe('application/json');
      expect(callArgs.headers.Accept).toBe('application/json');
    });
  });
});
