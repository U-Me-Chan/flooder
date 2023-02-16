import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import { LibRuGetBookText, LibRuGetDOM, LibRuGetLinksInDOM } from '../utils/libRuParserHelpers';
import { sleep } from '../utils/sleep';
import { createHash } from 'crypto';

axiosRetry(axios, { retries: 100 });

// Ссылки из общей навигации и прочее
const BLACKLIST_URLS = [
  'PROZA/',
  'INPROZ/',
  'POEZIQ/',
  'RUFANT/',
  'RUSS_DETEKTIW/',
  'HISTORY/',
  'What-s-new',
  'HITPARAD/',
  'Forum/',
  'Mirrors',
  '.dir_StripDir.html',
];

const CATEGORY_URLS = [
  'http://lib.ru/CULTURE/',
  'http://lib.ru/FILOSOF/',
  'http://lib.ru/URIKOVA/',
  'http://lib.ru/URIKOVA/SANTEM/',
  'http://lib.ru/ASTROLOGY/',
  'http://lib.ru/RELIGION/',
  'http://lib.ru/DIALEKTIKA/',
  'http://lib.ru/POLITOLOG/',
  'http://lib.ru/PSIHO/',
  'http://lib.ru/NLP/',
  'http://lib.ru/DPEOPLE/',
  'http://lib.ru/NTL/ECONOMY/',
  'http://lib.ru/NTL/KIBERNETIKA/',
  'http://lib.ru/NTL/ECOLOGY/',
  'http://lib.ru/NTL/AKUSTIKA/',
  'http://lib.ru/NTL/ASTRONOMY/',
  'http://lib.ru/NTL/CHEMISTRY/',
  'http://lib.ru/NTL/STROIT/',
  'http://lib.ru/NTL/TECH/',
  'http://lib.ru/NTL/STANDARTY/',
  'http://lib.ru/NTL/ARTICLES/',
  'http://lib.ru/RUSS_DETEKTIW/',
  'http://lib.ru/DETEKTIWY/',
  'http://lib.ru/HISTORY/',
  'http://lib.ru/MEMUARY/',
  'http://lib.ru/INOSTRHIST/',
  'http://lib.ru/HIST/',
  'http://lib.ru/RUFANT/',
  'http://lib.ru/INOFANT/',
  'http://lib.ru/TALES/',
  'http://lib.ru/PRIKL/',
  'http://lib.ru/POEEAST/',
  'http://lib.ru/INOOLD/',
  'http://lib.ru/PROZA/',
  'http://lib.ru/RUSSLIT/',
  'http://lib.ru/LITRA/',
  'http://lib.ru/SU/',
  'http://lib.ru/PXESY/',
  'http://lib.ru/NEWPROZA/',
  'http://lib.ru/INPROZ/',
];

export class CrawlerLibRu implements AbstractCrawler {
  storage: Storage;
  name = 'lib.ru';
  ready = false;
  breakTime = 750;
  authorsUrls: string[] = [];
  booksUrls: string[] = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    console.log('Crawler [lib.ru]: Start creating authors list');

    for (let catUrl of CATEGORY_URLS) {
      const links = (await this.getAuthorsUrlsByCategory(catUrl))
        .filter(link => {
          if (link.endsWith('.txt')) {
            this.booksUrls.push(link);
            return false;
          }

          return true;
        });
      this.authorsUrls = [...this.authorsUrls, ...links];
      await sleep(100);
    }

    this.authorsUrls = [...new Set(this.authorsUrls)];
    for (const authorUrl of this.authorsUrls) {
      console.log(`Crawler [lib.ru]: Processing link ${this.authorsUrls.findIndex((_) => _ === authorUrl) + 1} of ${this.authorsUrls.length}`);

      const links = await this.getBooksUrlsByAuthor(authorUrl);
      this.booksUrls = [...this.booksUrls, ...links];
    }

    this.booksUrls = [...new Set(this.booksUrls)];

    console.log(this.booksUrls);

    console.log(`Crawler [lib.ru]: Authors links found: ${this.authorsUrls.length}`);
  }

  private async getBooksUrlsByAuthor(authorUrl: string): Promise<string[]> {
    console.log(`Crawler [lib.ru]: Getting books list for ${authorUrl.replace('http://lib.ru/', '')}`);

    const raw = await axios.get<string>(authorUrl, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
    const dom = LibRuGetDOM(raw.data);
    const booksList = LibRuGetLinksInDOM(dom)
      .map(link => link.endsWith('.txt') ? link : '')
      .filter(link => link !== '');

    console.log(`Crawler [lib.ru]: found ${booksList.length} links for ${authorUrl}`);
    return booksList;
  }

  private async getAuthorsUrlsByCategory(categoryUrl: string): Promise<string[]> {
    console.log(`Crawler [lib.ru]: Getting authors list for ${categoryUrl.replace('http://lib.ru/', '')}`);

    const raw = await axios.get<string>(categoryUrl, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
    const dom = LibRuGetDOM(raw.data);
    const authorsLinks = LibRuGetLinksInDOM(dom)
      .map(link => link.replace('/', ''))
      .map(link => link.startsWith('..') ? '' : link)
      .map(link => link.startsWith('koi/') ? '' : link)
      .map(link => link.startsWith('win/') ? '' : link)
      .map(link => link.startsWith('lat/') ? '' : link)
      .map(link => BLACKLIST_URLS.includes(link) ? '' : link)
      .filter(link => link !== '')
      .map((link) => `${categoryUrl}${link}`);

    console.log(`Crawler [lib.ru]: found ${authorsLinks.length} links for ${categoryUrl}`);
    return authorsLinks;
  }

  async getNext(): Promise<{ text: string; nextAvailable: boolean; id?: string }> {
    const link = this.booksUrls.pop() || '';
    const id = createHash('sha256').update(link).digest('hex');

    if (await this.storage.checkIsFetched(id)) {
      return {
        text: '',
        id,
        nextAvailable: this.booksUrls.length > 0,
      };
    }

    console.log(`Crawler [lib.ru]: Getting book ${link} (books in queue: ${this.booksUrls.length})`);

    const { data } = await axios.get(link, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
    const dom = LibRuGetDOM(data);
    const text = LibRuGetBookText(dom);

    await this.storage.addFetched(id);

    return Promise.resolve({
      text,
      id,
      nextAvailable: this.booksUrls.length > 0,
    });
  }
}
