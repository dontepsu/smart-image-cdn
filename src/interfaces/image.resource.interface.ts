export interface IImageResource {
  // throws ImageNotFoundError
  get(path: string): Promise<Buffer>;
  put(path: string, image: Buffer): Promise<void>;
}