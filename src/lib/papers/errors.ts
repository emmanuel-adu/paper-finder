export class UpstreamHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UpstreamHttpError";
    this.status = status;
  }
}
