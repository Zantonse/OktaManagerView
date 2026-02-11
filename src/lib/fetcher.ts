/**
 * Shared SWR fetcher utility that properly handles HTTP error responses.
 *
 * This fetcher:
 * 1. Calls fetch(url)
 * 2. Checks res.ok — if false, throws an Error with the response status and any error message
 * 3. Returns res.json() on success
 *
 * This ensures that 401/403/500 error responses don't get silently parsed as valid data.
 */

export const fetcher = async (url: string | null): Promise<any> => {
  if (!url) {
    return null;
  }

  const res = await fetch(url);

  // If the response is not OK (status 200-299), throw an error
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;

    // Try to extract error message from response body
    try {
      const errorData = await res.json();
      if (errorData.errorSummary) {
        errorMessage = errorData.errorSummary;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If response body is not JSON, just use the status code message
      errorMessage = `${res.status} ${res.statusText || 'Error'}`;
    }

    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};
