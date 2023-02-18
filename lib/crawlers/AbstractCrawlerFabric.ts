import { AbstractCrawler } from './AbstractCrawler';
import { CrawlerFS } from './CrawlerFS';
import { CrawlerUmechan } from './CrawlerUmechan';
import { CrawlerLibRu } from './CrawlerLibRu';
import { CrawlerPanorama } from './CrawlerPanorama';
import { Storage } from '../Storage';
import { config } from '../config';

export const AbstractCrawlerFabric = (storage: Storage): AbstractCrawler[] => {
  return [
    new CrawlerFS(storage),
    new CrawlerUmechan(storage),
    new CrawlerLibRu(storage),
    new CrawlerPanorama(storage),
  ]
    .filter(crawler => config.crawlersMap[crawler.name]) as AbstractCrawler[];
};
