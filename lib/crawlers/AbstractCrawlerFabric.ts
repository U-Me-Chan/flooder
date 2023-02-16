import { CrawlerLibRu } from './CrawlerLibRu';
import { AbstractCrawler } from './AbstractCrawler';
import { Storage } from '../Storage';
import { CrawlerFS } from './CrawlerFS';

export const AbstractCrawlerFabric = (storage: Storage): AbstractCrawler[] => {
  return [
    new CrawlerFS(storage),
    new CrawlerLibRu(storage),
  ];
}
