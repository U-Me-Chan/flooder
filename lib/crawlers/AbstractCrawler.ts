import { Storage } from '../Storage';

export interface AbstractCrawler {
  storage: Storage;
  name: string;
  init(): Promise<void>;
  getNext(): Promise<{ text: string; nextAvailable: boolean }>
}
