import { readFileSync } from 'fs';
import * as ImageSize from 'image-size';
import * as FileType from 'file-type';
import * as path from 'path';

import { ImageService } from './image.service';

const testImagePath = path.join(__dirname, '../', 'data', 'testimage.jpg')

describe('ImageService', () => {
  let imageService: ImageService;
  let image: Buffer;

  beforeAll(() => {
    imageService = new ImageService();
    image = readFileSync(testImagePath);
  });

  it ('should resize image to 320 webp', async () => {
    const processedImage = await imageService.process(image, {
      format: 'webp',
      width: 320,
    });
    const fileType = await FileType.fromBuffer(processedImage);
    const dimensions = await ImageSize.imageSize(processedImage)
    expect(fileType.mime).toEqual('image/webp');
    expect(dimensions.width).toEqual(320);
  });

  it ('should resize image to 700 jpg', async () => {
    const processedImage = await imageService.process(image, {
      format: 'jpg',
      width: 700,
      quality: 90,
    });
    const fileType = await FileType.fromBuffer(processedImage);
    const dimensions = await ImageSize.imageSize(processedImage)
    expect(fileType.mime).toEqual('image/jpeg');
    expect(dimensions.width).toEqual(700);
  });

  it ('should resize image to 300, 300 jpg', async () => {
    const processedImage = await imageService.process(image, {
      format:'jpg',
      width: 300,
      height: 300,
    });
    const fileType = await FileType.fromBuffer(processedImage);
    const dimensions = await ImageSize.imageSize(processedImage)
    expect(fileType.mime).toEqual('image/jpeg');
    expect(dimensions.width).toEqual(300);
    expect(dimensions.height).toEqual(300);
  });

  it ('should resize image to larger than original jpg', async () => {
    const processedImage = await imageService.process(image, {
      format:'jpg',
      width: 1000,
      height: 1000,
    });
    const fileType = await FileType.fromBuffer(processedImage);
    const dimensions = await ImageSize.imageSize(processedImage)
    expect(fileType.mime).toEqual('image/jpeg');
    expect(dimensions.width).toEqual(1000);
    expect(dimensions.height).toEqual(1000);
  });

  it ('should keep dimensons and convert to webp', async () => {
    const originalDimensions = await ImageSize.imageSize(image);
    const processedImage = await imageService.process(image, {
      format:'webp',
    });
    const fileType = await FileType.fromBuffer(processedImage);
    const dimensions = await ImageSize.imageSize(processedImage)
    expect(fileType.mime).toEqual('image/webp');
    expect(dimensions.width).toEqual(originalDimensions.width);
    expect(dimensions.height).toEqual(originalDimensions.height);
  });
});
