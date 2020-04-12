import * as sharp from 'sharp';

export type ImageType = 'jpg' | 'webp';
export interface ProcessOptions {
  width?: number;
  height?: number;
  quality?: number;
  format: ImageType;
}

export class ImageService {

  public process(image: Buffer, options: ProcessOptions): Promise<Buffer> {
    let sharpChain = sharp(image);
    if (options.width) {
      sharpChain = sharpChain
        .resize(options.width, options.height);
    }
    
    if (options.format === 'webp') {
      sharpChain = sharpChain
        .webp({
          quality: options.quality,
        });
    } else {
      sharpChain = sharpChain
        .jpeg({
          quality: options.quality,
        });
    }

    return sharpChain.toBuffer();
  }
}