export class ClientError extends Error {
  readonly response: Response;
  constructor(message = 'Client error', response: Response) {
    super(message);
    this.name = 'ClientError';
    this.response = response;

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}

export class UnauthorizedError extends ClientError {
  constructor(message = 'Unauthorized', response: Response) {
    super(message, response);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class BadRequestError extends ClientError {
  constructor(message = 'Bad request', response: Response) {
    super(message, response);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends ClientError {
  constructor(message = 'Not found', response: Response) {
    super(message, response);
    this.name = 'NotFoundError';

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class TooManyRequestsError extends ClientError {
  constructor(message = 'Too many requests', response: Response) {
    super(message, response);
    this.name = 'TooManyRequestsError';
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export class InsufficientApiAccessError extends ClientError {
  constructor(message = 'Insufficient API access rights', response: Response) {
    super(message, response);
    this.name = 'InsufficientApiAccessError';

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, InsufficientApiAccessError.prototype);
  }
}

export class MissingApiKeyError extends Error {
  constructor(message = 'Missing API key') {
    super(message);
    this.name = 'MissingApiKeyError';

    Object.setPrototypeOf(this, MissingApiKeyError.prototype);
  }
}

export class InternalServerError extends ClientError {
  constructor(message = 'Internal server error', response: Response) {
    super(message, response);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class UnexpectedError extends ClientError {
  constructor(message = 'Unexpected error', response: Response) {
    super(message, response);
    this.name = 'UnexpectedError';
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }
}
