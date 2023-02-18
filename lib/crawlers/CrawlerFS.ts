import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import { readFile, readdir} from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';
import { config } from '../config';

export class CrawlerFS implements AbstractCrawler {
  storage: Storage;
  name = 'fs';
  isReady = false;
  isReCallable = false;
  breakTime = 1;

  private filePaths: string[] = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    console.log(`Crawler [${this.name}]: Reading corpus dirs contents`);

    const fileNames = await readdir(config.crawler.fs.corpusPath);
    const reservFileName = await readdir(config.crawler.fs.corpusReservPath);

    for (const fileName of fileNames) {
      const filePath = path.join(config.crawler.fs.corpusPath, fileName);
      this.filePaths.push(filePath);
    }

    for (const fileName of reservFileName) {
      const filePath = path.join(config.crawler.fs.corpusReservPath, fileName);
      this.filePaths.push(filePath);
    }

    this.isReady = true;
  }

  async getNext(): Promise<{ text: string; id?: string, nextAvailable: boolean }> {
    if (!this.filePaths.length) {
      return {
        text: '',
        id: undefined,
        nextAvailable: false,
      };
    }

    console.log(`Crawler [${this.name}]: Reading corpus #${this.filePaths.length}`);

    const filePath = this.filePaths.pop() || '';
    const id = createHash('sha256').update(filePath).digest('hex');

    const rawCorpusBuffer = await readFile(filePath);
    const rawCorpus = rawCorpusBuffer.toString('utf-8');

    await this.storage.addFetched(`${this.name}_${filePath}_${id}`);

    return {
      text: rawCorpus,
      id: `${this.name}_${filePath}_${id}`,
      nextAvailable: this.filePaths.length > 0,
    };
  }
}
