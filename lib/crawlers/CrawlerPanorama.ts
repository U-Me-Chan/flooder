import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';

const BASE_URL = 'https://panorama.pub';

const CATEGORIES_DATE_PRESENTER = [
  'politics',
  'society',
];

const CATEGORIES_GALLERY_PRESENTER = [
  'science',
  'economics',
];

const CATEGORIES_ARTICLES_PRESENTER = [
  'articles',
];

export class CrawlerPanorama implements AbstractCrawler {
  breakTime = 5000;
  name = 'panorama';
  isReady = false;
  isReCallable = false;
  storage: Storage;

  constructor (storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {

  }

  async getNext(): Promise<{ text: string; nextAvailable: boolean; id?: string }> {
    return {
      text: '',
      nextAvailable: false,
    };
  }
}
