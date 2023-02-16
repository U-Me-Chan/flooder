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
      res.json(corpus.generate());
    })
    .get('/crawler/run', (req, res) => {
      fetcher.init();
      fetcher.run();

      res.json('crawlers start working');
    })
    .get('/model/save', (req, res) => {
      corpus.saveModel()
        .then(() => storage.save())
        .then(() => res.json('saved'))
        .catch((err) => res.status(500).json(err));
    })
    .get('/model/load', (req, res) => {
      corpus.loadModel()
        .then(() => res.json('loaded'))
        .catch((err) => res.status(500).json(err));
    })
    .listen(3030, () => console.log('app started'));
};

main().catch(() => null);
