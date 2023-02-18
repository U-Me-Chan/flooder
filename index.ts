import express from 'express';
import { Corpus } from './lib/Corpus';
import { Storage } from './lib/Storage';
import { Fetcher } from './lib/Fetcher';

const main = async () => {
  const app = express();

  const storage = new Storage();
  const corpus = new Corpus();
  const fetcher = new Fetcher(storage, corpus);

  app
    .get('/', (req, res) => {
      console.log('App: request on /');

      res.json(corpus.generate());
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
    .get('/model/save', (req, res) => {
      console.log('App: request on /model/save');

      corpus.saveModel()
        .then(() => storage.save())
        .then(() => res.json('saved'))
        .catch((err) => res.status(500).json(err));
    })
    .get('/model/load', (req, res) => {
      console.log('App: request on /model/load');

      corpus.loadModel()
        .then(() => res.json('loaded'))
        .catch((err) => res.status(500).json(err));
    })
    .get('/state', (req, res) => {
      res.send(JSON.stringify(corpus.markov.corpus, null, 2));
    })
    .listen(3030, () => console.log('App: started'));
};

main().catch(() => null);
