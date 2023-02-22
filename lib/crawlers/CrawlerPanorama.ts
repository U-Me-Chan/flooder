import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import { sleep } from '../utils/sleep';
import { createHash } from 'crypto';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { config } from '../config';
import path from 'path';
import { parseDatePresented, parsePage } from '../utils/panoramaParserHelpers';

const BASE_URL = 'https://panorama.pub';
const CRAWLER_NAME = 'panorama';
const SLEEP_TIME = 5000;
const DATE_FORMAT = 'dd-MM-yyyy';

const CATEGORIES_DATE_PRESENTER = [
  'politics',
  'society',
];

// TODO: сделать это
const CATEGORIES_GALLERY_PRESENTER = [
  'science',
  'economics',
];

// TODO: сделать это
const CATEGORIES_ARTICLES_PRESENTER = [
  'articles',
];

export class PagePresentedParser {
  targetDay = new Date();

  async fetchData(categoryUrl: string) {
    const items: { title: string; text: string; comments: string[]; dateFormatted: string }[] = [];
    const request = axios.create({
      baseURL: BASE_URL,
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': `${BASE_URL}/${categoryUrl}`,
        'Accept': '*/*',
        'Host': 'panorama.pub',
      },
    });

    const dateFormatted = format(this.targetDay, DATE_FORMAT);
    const url = `/${categoryUrl}/${dateFormatted}`;

    try {
      console.log(`Crawler [${CRAWLER_NAME}]: Get index page "${url}"`)
      const raw = await request.get<string>(url);
      const rawHtml = raw.data.toString();
      
      const parsedPageItems = parseDatePresented(rawHtml);
      for (const item of parsedPageItems) {
        await sleep(SLEEP_TIME);

        console.log(`Crawler [${CRAWLER_NAME}]: Get news page "${item.url}"`);
        const rawPage = await request.get<string>(item.url);
        const rawPageHtml = rawPage.data.toString();

        const { text, comments } = parsePage(rawPageHtml);
        items.push({ title: item.title, comments, text, dateFormatted });
      }
    } catch (e) {
      console.log(`Crawler [${CRAWLER_NAME}]: Err fetching page: ${e}`);
    } finally {
      await sleep(SLEEP_TIME);
    }

    return items;
  }

  iterate() {
    this.targetDay = addDays(this.targetDay, -1);
  }
}

export class CrawlerPanorama implements AbstractCrawler {
  breakTime = SLEEP_TIME;
  name = CRAWLER_NAME;
  isReady = false;
  isReCallable = false;
  storage: Storage;

  parsers = {
    datePresenter: new PagePresentedParser(),
  };

  constructor (storage: Storage) {
    this.storage = storage;
  }

  async init(): Promise<void> {
    console.log(`Crawler [${this.name}]: start init`);
    this.isReady = true;
  }

  async getNext(): Promise<{ text: string; nextAvailable: boolean; id?: string; shouldSkipDelay?: boolean }> {
    this.parsers.datePresenter.iterate();
    const dateFormatted = format(this.parsers.datePresenter.targetDay, DATE_FORMAT);
    const id = createHash('sha256').update(dateFormatted).digest('hex');
    const filePath = path.resolve(config.crawler.panorama.corpusReservPath, `panorama_${id}.txt`);

    if (existsSync(filePath)) {
      console.log(`Crawler [${this.name}]: Content exists for "${dateFormatted}"`);

      return {
        text: '',
        nextAvailable: true,
        shouldSkipDelay: true,
      };
    }

    let text = '';

    try {
      for (const catUrl of CATEGORIES_DATE_PRESENTER) {
        const data = await this.parsers.datePresenter.fetchData(catUrl);
        const chunk = data.map(_ => [_.title, _.text, _.comments.join('\n')].join('\n')).join('\n');

        text = [text, chunk].join('\n');
        await sleep(this.breakTime);
      }

      console.log(`Crawler [${this.name}]: Write file "${filePath}"`);
      await writeFile(filePath, text);
      await this.storage.addFetched(id);
    } catch (e) {
      console.log(`Crawler [${this.name}]: error: ${e}`);
    }

    return {
      text,
      id,
      nextAvailable: true,
    };
  }
}
