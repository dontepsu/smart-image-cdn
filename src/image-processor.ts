import qs from 'qs';
import { createHash } from 'crypto';
import { IImageResource } from 'interfaces/image.resource.interface';
import { IImageService, ProcessOptions, ImageType } from 'interfaces/image.service.interface';


export class ImageProcessor {
  constructor (
    private imageService: IImageService,
    private imageResource: IImageResource,
  ) {}

  public async getImageOrProcess (
    path: string,
    queryString: string,
    acceptHeader: string,
  ): Promise<Buffer> {
    const pathWithoutExtension = path.replace(/\.(jpe?g|webp)$/i, '');
    const options = this.parseProcessOptions(acceptHeader, queryString);
    const cachedImageKey = this.getProcessedImagePath(pathWithoutExtension, options);

    const cachedImage = await this.tryGetImageOrNull(cachedImageKey);
    if (cachedImage !== null) {
      return cachedImage;
    }

    const originalImage = await this.imageResource.get(path);
    const processedImage = await this.imageService.process(originalImage, options);
    
    // TODO: figure out can this be done more efficiently
    await this.imageResource.put(cachedImageKey, processedImage);

    return processedImage;
  }

  public parseProcessOptions(acceptHeader: string, queryString: string): ProcessOptions {
    const format: ImageType = acceptHeader?.includes('image/webp') ? 'webp' : 'jpg';
    const queryObject = qs.parse(queryString.replace(/^\?/i, ''));
    const options: ProcessOptions = {
      format,
    };

    const width = Number(queryObject.w);
    const height = Number(queryObject.h);
    const quality = Number(queryObject.q);

    if (width > 0) {
      options.width = Math.ceil(width);
    }

    if (height > 0) {
      options.height = Math.ceil(height);
    }

    if (quality > 0 && quality <= 100) {
      options.quality = Math.ceil(quality);
    }

    return options;
  }

  private async tryGetImageOrNull (path: string): Promise<Buffer | null> {
    try {
      const image = await this.imageResource.get(path);

      return image;
    } catch (e) {
      return null;
    }
  }

  private getProcessedImagePath (path: string, options: ProcessOptions): string {
    const hash = createHash('md5').update(JSON.stringify(options)).digest('hex');
    return `${path}__${hash}.${options.format}`
  }
}