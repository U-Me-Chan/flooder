import express from 'express';
import { Corpus } from './lib/Corpus';
import { Storage } from './lib/Storage';
import { Fetcher } from './lib/Fetcher';

const main = async () => {
  const app = express();

  const storage = new Storage();
  const corpus = new Corpus();
  const fetcher = new Fetcher(storage, corpus);
  await fetcher.init();
  fetcher.start().catch(console.error);

  app
    .get('/', (req, res) => res.json(corpus.generate()))
    .listen(3030, () => console.log('app started'));
};

main().catch(() => null);
