import { readFile, writeFile } from 'fs/promises'
import { config } from './config';

export class Storage {
  private saved = false;
  private fetchedIds: string[] = [];

  constructor() {
    this.init()
      .then(() => console.log('Storage: loaded'))
      .catch(() => console.log('Storage: load failed'));
  }

  async init() {
    console.log('Storage: Start init');

    let rawStorage = '{ "fetchedIds": [] }';

    try {
      rawStorage = (await readFile(config.storage.fetchedPath)).toString();
    } catch (e) {
      await writeFile(config.storage.fetchedPath, rawStorage);
    }

    const { fetchedIds } = JSON.parse(rawStorage) as { fetchedIds: string[] };
    this.fetchedIds = fetchedIds;
  }

  public async save() {
    console.log('Storage: Start save request processing');

    if (!this.saved) {
      await writeFile(config.storage.fetchedPath, JSON.stringify({ fetchedIds: this.fetchedIds }));
      this.saved = true;
    }
  }

  async addFetched(id: string) {
    this.fetchedIds.push(id);
    this.saved = false;
  }

  async checkIsFetched(id: string): Promise<boolean> {
    return this.fetchedIds.includes(id);
  }
}
