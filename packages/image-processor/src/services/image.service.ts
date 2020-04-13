import sharp from 'sharp';
import { IImageService, ProcessOptions } from 'interfaces/image.service.interface';

export class ImageService implements IImageService {

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