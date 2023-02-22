import { AbstractCrawler } from './crawlers/AbstractCrawler';
import { AbstractCrawlerFabric } from './crawlers/AbstractCrawlerFabric';
import { Corpus } from './Corpus';
import { Storage } from './Storage';
import { sleep } from './utils/sleep';

import axiosRetry from 'axios-retry';
import axios from 'axios';
import { config } from './config';

axiosRetry(axios, { retries: config.axios.retryCount });

export class Fetcher {
  isInitialized = false;
  intervalRunning: Record<string, boolean> = {};
  intervals: Record<string, NodeJS.Timer> = {};
  disabledCrawlers: string[] = [];
  crawlers: AbstractCrawler[] = [];

  constructor(private storage: Storage, private corpus: Corpus) {
    this.crawlers = AbstractCrawlerFabric(this.storage);
  }

  async init() {
    if (this.isInitialized) {
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

    this.isInitialized = true;
  }

  async run() {
    const enabledCrawlers = this.crawlers
      .filter(_ => !this.disabledCrawlers.includes(_.name))
      .filter(_ => _.isReady);

    enabledCrawlers.forEach((crawler) => {
      const intervalExists = this.intervals[crawler.name] !== undefined;

      if (intervalExists) {
        return;
      }

      const runner = async () => {
        this.intervalRunning[crawler.name] = true;
        const { text, nextAvailable, id, shouldSkipDelay = false } = await crawler.getNext();

        if (text !== '' && id !== undefined && config.fetcher.loadFetchedIntoCorpus) {
          console.log(`Fetcher: Crawler [${crawler.name}]: returned corpus with #${id}`);
          this.corpus.push(text);
        }

        if (!nextAvailable) {
          console.log(`Fetcher: Crawler [${crawler.name}]: next text chunk not available`);
          this.disabledCrawlers.push(crawler.name);

          clearInterval(this.intervals[crawler.name]);
          this.intervals[crawler.name] = undefined as unknown as NodeJS.Timer;

          if (crawler.isReCallable) {
            setTimeout(() => {
              console.log(`Fetcher: Crawler [${crawler.name}]: removed from stoplist for calling .getNext()`);
              this.disabledCrawlers = this.disabledCrawlers.filter(_ => _ !== crawler.name);
            }, config.fetcher.recallInterval);
          }
        }

        if (!shouldSkipDelay) {
          await sleep(crawler.breakTime);
        }

        this.intervalRunning[crawler.name] = false;
      }

      this.intervals[crawler.name] = setInterval(async () => {
        if (!this.intervalRunning[crawler.name]) {
          runner();
        }
      }, 25);
    });

    setTimeout(() => this.run(), 1000);
  }
}
