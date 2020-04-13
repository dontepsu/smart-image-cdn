import * as path from 'path';
import * as fs from 'fs';

import { FileSystemImageResource } from './filesystem-image.resource';
import { ImageNotFoundError } from 'errors/image-not-found.error';

const imagesBasePath = path.join(__dirname, '..', '..', 'data');

describe('FileSystemImageResource', () => {
  let imageResource: FileSystemImageResource;

  beforeAll(() => {
    imageResource = new FileSystemImageResource(imagesBasePath);
  });

  afterAll(async () => {
    await fs.promises.unlink(path.join(imagesBasePath, 'testimage2.jpg'));
  })

  it('should return dog image', async () => {
    const dogImage = await imageResource.get('dogs/goldie.jpg');
    expect(typeof dogImage).toEqual('object');
  });

  it('should return testimage', async () => {
    const testImage = await imageResource.get('testimage.jpg');
    expect(typeof testImage).toEqual('object');
  });

  it('should throw ImageNotFoundError', async () => {
    expect(imageResource.get('notfound.jpg')).rejects.toThrow(ImageNotFoundError);
  });

  it('should put testimage2', async () => {
    const testImage = await imageResource.get('testimage.jpg');
    await imageResource.put('testimage2.jpg', testImage)
    const testImage2 = await imageResource.get('testimage2.jpg');
    expect(typeof testImage2).toEqual('object');
  });
});
