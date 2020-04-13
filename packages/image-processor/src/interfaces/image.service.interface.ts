export interface IImageService {
  process(image: Buffer, options: ProcessOptions): Promise<Buffer>;
}

export type ImageType = 'jpg' | 'webp';

export interface ProcessOptions {
  width?: number;
  height?: number;
  quality?: number;
  format: ImageType;
}
