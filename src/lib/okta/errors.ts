export class OktaApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public errorCauses?: string[];

  constructor(message: string, statusCode: number, errorCode?: string, errorCauses?: string[]) {
    super(message);
    this.name = 'OktaApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorCauses = errorCauses;
  }

  getUserFriendlyMessage(): string {
    switch (this.statusCode) {
      case 401:
        return 'Authentication failed. Please check your API token configuration.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        if (this.statusCode >= 500) {
          return 'Okta service is temporarily unavailable. Please try again later.';
        }
        return this.message;
    }
  }

  toJSON() {
    return {
      error: this.getUserFriendlyMessage(),
      code: this.errorCode,
      status: this.statusCode,
    };
  }
}
