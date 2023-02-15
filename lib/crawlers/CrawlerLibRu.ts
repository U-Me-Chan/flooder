import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';

export class CrawlerLibRu implements AbstractCrawler {
  storage: Storage;
  name = 'lib.ru';

  constructor(storage: Storage) {
    this.storage = storage;
  }

  init(): Promise<void> {
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
