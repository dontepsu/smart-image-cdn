import qs from 'qs';
import { createHash } from 'crypto';
import { IImageResource } from './interfaces/image.resource.interface';
import { ImageProcessorResponse } from './interfaces/image-processor-response.interface';
import { IImageService, ProcessOptions, ImageType } from './interfaces/image.service.interface';
import { ImageService } from './services/image.service';
import * as FileType from 'file-type';

export class ImageProcessor {
  constructor (
    private imageResource: IImageResource,
    private processedImageResource: IImageResource = imageResource,
    private imageService: IImageService = new ImageService(),
  ) {}

  public async getImageOrProcess (
    path: string,
    queryString: string,
    acceptHeader: string,
  ): Promise<ImageProcessorResponse> {
    const pathWithoutExtension = path.replace(/\.(jpe?g|webp)$/i, '');
    const options = ImageProcessor.parseProcessOptions(acceptHeader, queryString);
    const cachedImageKey = ImageProcessor.getProcessedImagePath(pathWithoutExtension, options);

    const cachedImage = await this.tryGetProcessedImageOrNull(cachedImageKey);
    if (cachedImage !== null) {
      return this.createResponse(cachedImage);
    }

    const originalImage = await this.imageResource.get(path);
    const processedImage = await this.imageService.process(originalImage, options);
    
    // TODO: figure out can this be done more efficiently
    await this.processedImageResource.put(cachedImageKey, processedImage);

    return this.createResponse(processedImage);
  }

  public static parseProcessOptions(acceptHeader: string, queryString: string): ProcessOptions {
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

  public static getProcessedImagePath (path: string, options: ProcessOptions): string {
    const hash = createHash('md5').update(JSON.stringify(options)).digest('hex');
    return `${path}__${hash}.${options.format}`
  }

  private async createResponse (image: Buffer): Promise<ImageProcessorResponse> {
    const fileType = await FileType.fromBuffer(image);

    return {
      image,
      size: image.length,
      contentType: fileType.mime,
    };
  }

  private async tryGetProcessedImageOrNull (path: string): Promise<Buffer | null> {
    try {
      const image = await this.processedImageResource.get(path);

      return image;
    } catch (e) {
      return null;
    }
  }
}