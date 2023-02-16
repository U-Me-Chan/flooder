import { readFile, writeFile } from 'fs/promises'

const STORAGE_FILE_PATH = 'storage/fetched.json';

export class Storage {
  private saved = false;
  private fetchedIds: string[] = [];

  constructor() {
    this.init()
      .then(() => console.log('Storage: loaded'))
      .catch(() => console.log('Storage: load failed'));
  }

  async init() {
    let rawStorage = '{ "fetchedIds": [] }';

    try {
      rawStorage = (await readFile(STORAGE_FILE_PATH)).toString();
    } catch (e) {
      await writeFile(STORAGE_FILE_PATH, rawStorage);
    }

    const { fetchedIds } = JSON.parse(rawStorage) as { fetchedIds: string[] };
    this.fetchedIds = fetchedIds;
  }

  public async save() {
    if (!this.saved) {
      await writeFile(STORAGE_FILE_PATH, JSON.stringify({ fetchedIds: this.fetchedIds }));
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
