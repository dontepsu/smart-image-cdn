import * as path from 'path';

import { FileSystemImageResource } from './filesystem-image.resource';
import { ImageNotFoundError } from 'errors/image-not-found.error';

const imagesBasePath = path.join(__dirname, '..', '..', 'data');

describe('FileSystemImageResource', () => {
  let imageResource: FileSystemImageResource;

  beforeAll(() => {
    imageResource = new FileSystemImageResource(imagesBasePath);
  });

  it('should return dog image', async () => {
    const dogImage = await imageResource.get('dogs/goldie.jpg');
    expect(typeof dogImage).toEqual('object');
  });

  it('should return testimage', async () => {
    const dogImage = await imageResource.get('testimage.jpg');
    expect(typeof dogImage).toEqual('object');
  });

  it('should throw ImageNotFoundError', async () => {
    expect(imageResource.get('notfound.jpg')).rejects.toThrow(ImageNotFoundError);
  });
});
