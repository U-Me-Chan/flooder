import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import { readFile, readdir} from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';

const CORPUS_PATH = 'corpus/';

export class CrawlerFS implements AbstractCrawler {
  storage: Storage;
  name = 'fs';
  breakTime = 100;

  private filePaths: string[] = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    const fileNames = await readdir(CORPUS_PATH);

    for (const fileName of fileNames) {
      const filePath = path.join(CORPUS_PATH, fileName);
      this.filePaths.push(filePath);
    }
  }

  async getNext(): Promise<{ text: string; id?: string, nextAvailable: boolean }> {
    if (!this.filePaths.length) {
      return {
        text: '',
        id: undefined,
        nextAvailable: false,
      };
    }

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
