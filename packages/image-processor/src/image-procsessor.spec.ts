import * as pathModule from 'path';
import * as fs from 'fs';
import { ImageProcessor } from 'image-processor';
import { IImageService, ProcessOptions } from 'interfaces/image.service.interface';
import { IImageResource } from 'interfaces/image.resource.interface';
import { ImageNotFoundError } from 'errors/image-not-found.error';

const imagesBasePath = pathModule.join(__dirname, '..', '..', '..', 'data');

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor;
  let mockImageService: IImageService;
  let mockImageResource: IImageResource;
  let testImage: Buffer;

  beforeAll(async () => {
    testImage = await fs.promises.readFile(pathModule.join(imagesBasePath, 'testimage.jpg'));
  })

  beforeEach(() => {
    mockImageService = {
      process: jest.fn(async (image: Buffer, options: ProcessOptions): Promise<Buffer> => {
        return image;
      }),
    }

    const images = new Map<string, Buffer>([
      ['found.jpg', testImage],
      [ImageProcessor.getProcessedImagePath('cached', ImageProcessor.parseProcessOptions('', '?w=100')), testImage],
    ]);
      
    mockImageResource = {
      get: jest.fn(async (path: string): Promise<Buffer> => {
        if (images.has(path)) {
          return images.get(path);
        }

        throw new ImageNotFoundError();
      }),
      put: jest.fn(async (path: string, image: Buffer): Promise<void> => {
        images.set(path, testImage);
      }),
    }
  
    imageProcessor = new ImageProcessor(
      mockImageService,
      mockImageResource,
    );
  });

  it('should parse ProcessOptions', async () => {
    const tests: { qs: string, accept: string, expection: ProcessOptions }[] = [
      { qs: '', accept: '', expection: { format: 'jpg' } },
      { qs: '?', accept: '', expection: { format: 'jpg' } },
      { qs: '?w=100', accept: '', expection: { format: 'jpg', width: 100 } },
      { qs: '?w=100', accept: '*/*,image/webp', expection: { format: 'webp', width: 100 } },
      { qs: '?w=100&h=100', accept: '*/*,image/webp', expection: { format: 'webp', width: 100, height: 100 } },
      { qs: 'w=-100', accept: '*/*,image/webp', expection: { format: 'webp' } },
      { qs: '?w=200&q=70', accept: '*/*,image/webp', expection: { format: 'webp', width: 200, quality: 70 } },
      { qs: '?w=200&q=700', accept: '*/*,image/webp', expection: { format: 'webp', width: 200 } },
      { qs: 'w=200&q=0', accept: '*/*,image/webp', expection: { format: 'webp', width: 200 } },
      { qs: '?w=200&q=-10', accept: '*/*,image/webp', expection: { format: 'webp', width: 200 } },
    ];

    tests.forEach(({ qs, accept, expection }) => {
      expect(ImageProcessor.parseProcessOptions(accept, qs)).toEqual(expection);
    })
  });

  it('should return cached image', async () => {
    const image = await imageProcessor.getImageOrProcess('cached.jpg', '?w=100', '');
    expect(typeof image).toEqual('object');
    expect(image !== null).toBeTruthy();
    expect((mockImageService.process as jest.Mock).mock.calls.length).toEqual(0);
    expect((mockImageResource.get as jest.Mock).mock.calls.length).toEqual(1);
    expect((mockImageResource.put as jest.Mock).mock.calls.length).toEqual(0);
  });

  it('should return processed image', async () => {
    const image = await imageProcessor.getImageOrProcess('found.jpg', '?w=100', 'image/webp');
    expect(typeof image).toEqual('object');
    expect(image !== null).toBeTruthy();
    expect((mockImageService.process as jest.Mock).mock.calls.length).toEqual(1);
    expect((mockImageService.process as jest.Mock).mock.calls[0][1]).toEqual({
      format: 'webp',
      width: 100,
    });
    expect((mockImageResource.get as jest.Mock).mock.calls.length).toEqual(2);
    expect((mockImageResource.put as jest.Mock).mock.calls.length).toEqual(1);
  });

  it('should return processed image', async () => {
    const promise = imageProcessor.getImageOrProcess('doesntexist.jpg', '?w=100', '');
    expect(promise).rejects.toThrowError(ImageNotFoundError);
  });

});
