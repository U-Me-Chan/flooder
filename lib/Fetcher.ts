import { AbstractCrawler } from './crawlers/AbstractCrawler';
import { AbstractCrawlerFabric } from './crawlers/AbstractCrawlerFabric';
import { Corpus } from './Corpus';
import { Storage } from './Storage';
import { sleep } from './utils/sleep';

export class Fetcher {
  disabledCrawlers: string[] = [];
  crawlers: AbstractCrawler[] = [];

  constructor(private storage: Storage, private corpus: Corpus) {
    this.crawlers = AbstractCrawlerFabric(this.storage);
  }

  async init() {
    await Promise.all(this.crawlers.map(async (crawler) => {
      try {
        await crawler.init();
      } catch (e) {
        console.log(`Crawler [${crawler.name}]: Failed init: ${e}`)
      }
    }));
  }

  async run() {
    const enabledCrawlers = this.crawlers
      .filter(_ => !this.disabledCrawlers.includes(_.name))
      .filter(_ => _.ready);

    const promises = enabledCrawlers.map(async (crawler) => {
      const { text, nextAvailable, id } = await crawler.getNext();

      if (text !== '' && id !== undefined) {
        console.log(`Crawler [${crawler.name}]: returned corpus with #${id}`);
        this.corpus.push(text);
      }

      if (!nextAvailable) {
        console.log(`Crawler [${crawler.name}]: next text chunk not available`);
        this.disabledCrawlers.push(crawler.name);
      }

      await sleep(crawler.breakTime);
    });

    await Promise.all(promises);
    setTimeout(() => this.run(), 250);
  }
}
