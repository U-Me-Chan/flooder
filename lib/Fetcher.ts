import { AbstractCrawler } from './crawlers/AbstractCrawler';
import { AbstractCrawlerFabric } from './crawlers/AbstractCrawlerFabric';
import { Corpus } from './Corpus';
import { Storage } from './Storage';

export class Fetcher {
  crawlers: AbstractCrawler[] = [];

  constructor(private storage: Storage, private corpus: Corpus) {
    this.crawlers = AbstractCrawlerFabric(this.storage);
  }

  async init() {
    for (let crawler of this.crawlers) {
      await crawler.init();
    }
  }

  async start() {
    await this.run();
    setTimeout(() => this.start(), 5000);
  }

  async run() {
    for (let crawler of this.crawlers) {
      const { text, nextAvailable } = await crawler.getNext();

      if (text !== '') {
        this.corpus.push(text);
      }

      if (!nextAvailable) {
        console.log(`Crawler "${crawler.name}" reported: next text chunk not available`);
      }
    }
  }
}
