import ApiError from './ApiError';

abstract class ValidatedRequest {
  private apiErrors: ApiError[];

  constructor() {
    this.apiErrors = [] as ApiError[];
  }

  public addError(field: string, message: string) {
    this.apiErrors.push({field, message});
  }

  public hasErrors(): boolean {
    return this.apiErrors.length > 0
  }

  public errors(): ApiError[] {
    return this.apiErrors;
  }

  abstract valid(): boolean;
};

export default ValidatedRequest
