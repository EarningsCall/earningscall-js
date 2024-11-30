export class InsufficientApiAccessError extends Error {
  constructor(message = 'Insufficient API access rights') {
    super(message);
    this.name = 'InsufficientApiAccessError';

    // This line is needed to maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, InsufficientApiAccessError.prototype);
  }
}
