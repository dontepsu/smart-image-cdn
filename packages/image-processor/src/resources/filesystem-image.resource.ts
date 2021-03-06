import * as fs from 'fs';
import * as pathModule from 'path';

import { IImageResource } from '../interfaces/image.resource.interface';
import { ImageNotFoundError } from '../errors/image-not-found.error';

export class FileSystemImageResource implements IImageResource {
  constructor (
    private basePath: string,
  ) {}

  async get(path: string): Promise<Buffer> {
    try {
      const image = await fs.promises.readFile(pathModule.join(this.basePath, path));

      return image;
    } catch (e) {
      throw new ImageNotFoundError(e.message);
    }
  }

  async put(path: string, image: Buffer): Promise<void> {
    await this.createDirs(path);
    await fs.promises.writeFile(pathModule.join(this.basePath, path), image);
  }

  private async createDirs(path: string): Promise<void> {
    const pathSlices = path.split('/');
    const dirs = pathSlices.slice(0, pathSlices.length - 1).join('/');

    await fs.promises.mkdir(pathModule.join(this.basePath, dirs), { recursive: true });
  }
}