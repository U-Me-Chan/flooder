import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import axios from 'axios';
import { LibRuGetBookText, LibRuGetDOM, LibRuGetLinksInDOM } from '../utils/libRuParserHelpers';
import { sleep } from '../utils/sleep';
import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const RESERV_PATH = 'corpus-reserv/';
const CACHED_URLS_PATH = 'storage/crawler_lib_ru_urls.json';

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
  breakTime = 2500;
  authorsUrls: string[] = [];
  booksUrls: string[] = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    console.log(`Crawler [${this.name}]: Start creating authors list`);

    try {
      const { booksUrls, authorsUrls } = JSON.parse((await readFile(CACHED_URLS_PATH)).toString());
      this.booksUrls = booksUrls;
      this.authorsUrls = authorsUrls;
    } catch {
      for (let catUrl of CATEGORY_URLS) {
        try {
          const links = (await this.getAuthorsUrlsByCategory(catUrl))
            .filter(link => {
              if (link.includes('.txt') && !link.includes('.txt_Contents')) {
                this.booksUrls.push(link);
                return false;
              }

              return true;
            });
          this.authorsUrls = [...this.authorsUrls, ...links];
        } catch {
          // skip
        } finally {
          await sleep(this.breakTime);
        }
      }

      this.authorsUrls = [...new Set(this.authorsUrls)];
      for (const authorUrl of this.authorsUrls) {
        console.log(`Crawler [${this.name}]: Processing link ${this.authorsUrls.findIndex((_) => _ === authorUrl) + 1} of ${this.authorsUrls.length}`);

        try {
          const links = await this.getBooksUrlsByAuthor(authorUrl);
          this.booksUrls = [...this.booksUrls, ...links];
        } catch {
          // skip
        } finally {
          await sleep(this.breakTime);
        }
      }

      this.booksUrls = [...new Set(this.booksUrls)];

      await writeFile(CACHED_URLS_PATH, JSON.stringify({ booksUrls: this.booksUrls, authorsUrls: this.authorsUrls }));
    }

    console.log(`Crawler [${this.name}]: Authors links found: ${this.authorsUrls.length}`);
    console.log(`Crawler [${this.name}]: Books links found: ${this.booksUrls.length}`);

    this.ready = true;
  }

  private async getBooksUrlsByAuthor(authorUrl: string): Promise<string[]> {
    console.log(`Crawler [${this.name}]: Getting books list for ${authorUrl.replace('http://lib.ru/', '')} [delay ${this.breakTime}ms]`);

    const raw = await axios.get<string>(authorUrl, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
    const dom = LibRuGetDOM(raw.data);
    const booksList = LibRuGetLinksInDOM(dom)
      .map(link => link.includes('.txt') ? link : '')
      .filter(link => link !== '')
      .map((link) => `${authorUrl}${link}`);

    console.log(`Crawler [${this.name}]: found ${booksList.length} links for ${authorUrl}`);
    return booksList;
  }

  private async getAuthorsUrlsByCategory(categoryUrl: string): Promise<string[]> {
    console.log(`Crawler [${this.name}]: Getting authors list for ${categoryUrl.replace('http://lib.ru/', '')} [delay ${this.breakTime}ms]`);

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
      .map(link => link.includes('.txt_Contents') ? '' : link)
      .map(link => BLACKLIST_URLS.includes(link) ? '' : link)
      .filter(link => link !== '')
      .map((link) => `${categoryUrl}${link}`);

    console.log(`Crawler [${this.name}]: found ${authorsLinks.length} links for ${categoryUrl}`);
    return authorsLinks;
  }

  async getNext(): Promise<{ text: string; nextAvailable: boolean; id?: string }> {
    const link = this.booksUrls.pop() || '';
    const id = createHash('sha256').update(link).digest('hex');

    if (existsSync(`${RESERV_PATH}/libru_${id}.txt`) || await this.storage.checkIsFetched(id)) {
      return {
        text: '',
        id,
        nextAvailable: this.booksUrls.length > 0,
      };
    }

    try {
      console.log(`Crawler [${this.name}]: Getting book ${link} (books in queue: ${this.booksUrls.length})`);

      const { data } = await axios.get(link, {
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      });
      const dom = LibRuGetDOM(data);
      const text = LibRuGetBookText(dom);

      await this.storage.addFetched(id);
      await writeFile(`${RESERV_PATH}/libru_${id}.txt`, text);

      return {
        text,
        id,
        nextAvailable: this.booksUrls.length > 0,
      };
    } catch (e) {
      return {
        text: '',
        id,
        nextAvailable: this.booksUrls.length > 0,
      };
    }
  }
}
