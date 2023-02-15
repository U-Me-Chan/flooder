import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import path from 'path';

export class CrawlerFS implements AbstractCrawler {
  storage: Storage;
  name = 'fs';

  constructor(storage: Storage) {
    this.storage = storage;
  }

  init(): Promise<void> {
    const rawCorpusPath = path.join(__dirname, '../../../corpus');

    console.log(__dirname, rawCorpusPath);
    return Promise.resolve();
  }

  async getNext(): Promise<{ text: string; nextAvailable: boolean }> {
    await this.storage.addFetched(`${this.name}_test`);

    return Promise.resolve({
      text: 'lib.ru',
      nextAvailable: false,
    });
  }
}
