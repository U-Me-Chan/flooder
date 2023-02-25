import express from 'express';
import { Corpus } from './lib/Corpus';
import { Storage } from './lib/Storage';
import { Fetcher } from './lib/Fetcher';
import { config } from './lib/config';

const main = async () => {
  const app = express();

  const storage = new Storage();
  const corpus = new Corpus();
  const fetcher = new Fetcher(storage, corpus);

  app
    .get('/', (req, res) => {
      console.log('App: request on /');

      corpus.generate().then((response) => res.json(response));
    })
    .get('/tree', (req, res) => {
      console.log('App: request on /tree');

      corpus.markov.genTree('__START__', 1, 10, 2).then((response) => res.json(corpus.markov.flattenTree(response || [])));
    })
    .get('/crawler/run', (req, res) => {
      console.log('App: request on /crawler/run');

      if (fetcher.isInitialized) {
        res.status(500).json('already running');
      } else {
        fetcher.init();
        fetcher.run();

        res.json('crawlers start working');
      }
    })
    .listen(config.app.listenPort, () => console.log('App: started'));
};

main().catch(() => null);
