import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetcher } from '@/lib/fetcher';

describe('SWR Fetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful responses', () => {
    it('should return parsed JSON on 200 response', async () => {
      const mockData = { id: 'usr001', email: 'test@example.com' };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users/usr001');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/users/usr001');
    });

    it('should return parsed JSON on 201 response', async () => {
      const mockData = { id: 'usr002', created: true };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users');

      expect(result).toEqual(mockData);
    });

    it('should return array on successful response', async () => {
      const mockData = [
        { id: 'usr001', email: 'test1@example.com' },
        { id: 'usr002', email: 'test2@example.com' },
      ];

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockData);
    });

    it('should handle null URL and return null', async () => {
      const result = await fetcher(null);

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle undefined URL and return null', async () => {
      const result = await fetcher(undefined);

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('error responses', () => {
    it('should throw error on 400 response', async () => {
      const errorData = {
        error: 'Bad Request',
        message: 'Invalid request parameters',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      await expect(fetcher('/api/users')).rejects.toThrow('Bad Request');
    });

    it('should throw error on 401 response', async () => {
      const errorData = {
        errorSummary: 'Authentication failed',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      await expect(fetcher('/api/users')).rejects.toThrow('Authentication failed');
    });

    it('should throw error on 403 response', async () => {
      const errorData = {
        error: 'Forbidden',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      await expect(fetcher('/api/users')).rejects.toThrow('Forbidden');
    });

    it('should throw error on 404 response', async () => {
      const errorData = {
        errorSummary: 'Resource not found',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      await expect(fetcher('/api/users/nonexistent')).rejects.toThrow(
        'Resource not found'
      );
    });

    it('should throw error on 500 response', async () => {
      const errorData = {
        message: 'Internal Server Error',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      await expect(fetcher('/api/users')).rejects.toThrow('Internal Server Error');
    });
  });

  describe('error message extraction', () => {
    it('should prioritize errorSummary from Okta response', async () => {
      const errorData = {
        errorSummary: 'Okta API error message',
        error: 'Generic error',
        message: 'Another message',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as Error).message).toBe('Okta API error message');
      }
    });

    it('should fallback to error field', async () => {
      const errorData = {
        error: 'Custom error message',
        message: 'Another message',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as Error).message).toBe('Custom error message');
      }
    });

    it('should fallback to message field', async () => {
      const errorData = {
        message: 'Message field value',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve(errorData),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as Error).message).toBe('Message field value');
      }
    });

    it('should use HTTP status message when no error fields in response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({}),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as Error).message).toMatch(/500|Internal Server Error|HTTP 500/);
      }
    });
  });

  describe('network errors', () => {
    it('should throw error on fetch network failure', async () => {
      const networkError = new Error('Network error: Connection refused');

      global.fetch = vi.fn(() => Promise.reject(networkError));

      await expect(fetcher('/api/users')).rejects.toThrow('Connection refused');
    });

    it('should handle non-JSON error response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          statusText: 'Bad Gateway',
          json: () => Promise.reject(new Error('Not JSON')),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as Error).message).toContain('502');
      }
    });
  });

  describe('error object extensions', () => {
    it('should attach status code to error object', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ error: 'Not found' }),
        } as Response)
      );

      try {
        await fetcher('/api/users/nonexistent');
      } catch (error) {
        expect((error as any).status).toBe(404);
      }
    });

    it('should include status for 401 errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ errorSummary: 'Token expired' }),
        } as Response)
      );

      try {
        await fetcher('/api/users');
      } catch (error) {
        expect((error as any).status).toBe(401);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty response body', async () => {
      const mockData = {};

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users');

      expect(result).toEqual({});
    });

    it('should handle large response payloads', async () => {
      const mockData = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: `usr${i}`,
          email: `user${i}@example.com`,
        })),
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users');

      expect(result.users).toHaveLength(1000);
    });

    it('should handle string response values', async () => {
      const mockData = { message: 'Success' };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users');

      expect(result.message).toBe('Success');
    });

    it('should preserve nested object structures', async () => {
      const mockData = {
        user: {
          id: 'usr001',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
          groups: ['grp001', 'grp002'],
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await fetcher('/api/users/usr001');

      expect(result.user.profile.firstName).toBe('John');
      expect(result.user.groups).toHaveLength(2);
    });
  });
});
