export interface IImageResource {
  // throws ImageNotFoundError
  get(path: string): Promise<Buffer>;
}