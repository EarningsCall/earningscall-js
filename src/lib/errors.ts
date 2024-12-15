export class ClientError extends Error {
  readonly response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.name = 'ClientError';
    this.response = response;

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}

export class UnauthorizedError extends ClientError {
  constructor(response: Response) {
    super('Unauthorized', response);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class BadRequestError extends ClientError {
  constructor(response: Response) {
    super('Bad request', response);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends ClientError {
  constructor(response: Response) {
    super('Not found', response);
    this.name = 'NotFoundError';

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class TooManyRequestsError extends ClientError {
  constructor(response: Response) {
    super('Too many requests', response);
    this.name = 'TooManyRequestsError';
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export class InsufficientApiAccessError extends ClientError {
  constructor(message: string, response: Response) {
    super(message, response);
    this.name = 'InsufficientApiAccessError';

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, InsufficientApiAccessError.prototype);
  }
}

export class MissingApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingApiKeyError';

    Object.setPrototypeOf(this, MissingApiKeyError.prototype);
  }
}

export class InternalServerError extends ClientError {
  constructor(response: Response) {
    super('Internal server error', response);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
export class UnexpectedError extends ClientError {
  constructor(message: string, response: Response) {
    super(message, response);
    this.name = 'UnexpectedError';
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }
}
