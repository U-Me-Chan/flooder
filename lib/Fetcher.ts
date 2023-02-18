import { AbstractCrawler } from './crawlers/AbstractCrawler';
import { AbstractCrawlerFabric } from './crawlers/AbstractCrawlerFabric';
import { Corpus } from './Corpus';
import { Storage } from './Storage';
import { sleep } from './utils/sleep';

import axiosRetry from 'axios-retry';
import axios from 'axios';

axiosRetry(axios, { retries: 100 });

const RECHECK_CRAWLER_TIMEOUT = 60 * 1000;

export class Fetcher {
  inited = false;
  running = false;
  disabledCrawlers: string[] = [];
  crawlers: AbstractCrawler[] = [];

  constructor(private storage: Storage, private corpus: Corpus) {
    this.crawlers = AbstractCrawlerFabric(this.storage);
  }

  async init() {
    if (this.inited) {
      return;
    }

    console.log(`Fetcher: start init`);

    await Promise.all(this.crawlers.map(async (crawler) => {
      try {
        await crawler.init();
      } catch (e) {
        console.log(`Fetcher: Crawler [${crawler.name}]: Failed init: ${e}`);
      }
    }));

    this.inited = true;
  }

  async run() {
    const enabledCrawlers = this.crawlers
      .filter(_ => !this.disabledCrawlers.includes(_.name))
      .filter(_ => _.ready);

    const promises = enabledCrawlers.map(async (crawler) => {
      const { text, nextAvailable, id } = await crawler.getNext();

      if (text !== '' && id !== undefined) {
        console.log(`Fetcher: Crawler [${crawler.name}]: returned corpus with #${id}`);
        this.corpus.push(text);
      }

      if (!nextAvailable) {
        console.log(`Fetcher: Crawler [${crawler.name}]: next text chunk not available`);
        this.disabledCrawlers.push(crawler.name);
        
        if (crawler.isRecallable) {
          setTimeout(() => {
            console.log(`Fetcher: Crawler [${crawler.name}]: removed from stoplist for calling .getNext()`);
            this.disabledCrawlers = this.disabledCrawlers.filter(_ => _ !== crawler.name);
          }, RECHECK_CRAWLER_TIMEOUT);
        }
      }

      await sleep(crawler.breakTime);
    });

    await Promise.all(promises);
    setTimeout(() => this.run(), enabledCrawlers.length > 0 ? 0 : 1000);
  }
}
