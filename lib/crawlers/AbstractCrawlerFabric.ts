import { AbstractCrawler } from './AbstractCrawler';
import { CrawlerFS } from './CrawlerFS';
import { CrawlerUmechan } from './CrawlerUmechan';
import { CrawlerLibRu } from './CrawlerLibRu';
import { Storage } from '../Storage';

export const AbstractCrawlerFabric = (storage: Storage): AbstractCrawler[] => {
  return [
    new CrawlerFS(storage),
    new CrawlerUmechan(storage),
    new CrawlerLibRu(storage),
  ];
};
