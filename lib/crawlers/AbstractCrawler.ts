import { Storage } from '../Storage';

export interface AbstractCrawler {
  /**
   * Время паузы между запросами.
   */
  breakTime: number;

  storage: Storage;

  name: string;

  ready: boolean;

  init(): Promise<void>;

  getNext(): Promise<{ text: string; nextAvailable: boolean; id?: string }>
}
