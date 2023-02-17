import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import { readFile, readdir} from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';

const CORPUS_PATH = 'corpus/';
const RESERV_CORPUS_PATH = 'corpus-reserv/';

export class CrawlerFS implements AbstractCrawler {
  storage: Storage;
  name = 'fs';
  ready = false;
  breakTime = 1;

  private filePaths: string[] = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    console.log(`Crawler [${this.name}]: Reading corpus dirs contents`);

    const fileNames = await readdir(CORPUS_PATH);
    const reservFileName = await readdir(RESERV_CORPUS_PATH);

    for (const fileName of fileNames) {
      const filePath = path.join(CORPUS_PATH, fileName);
      this.filePaths.push(filePath);
    }

    for (const fileName of reservFileName) {
      const filePath = path.join(RESERV_CORPUS_PATH, fileName);
      this.filePaths.push(filePath);
    }

    this.ready = true;
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
