import path from 'path';
import { readFile } from 'fs/promises';

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

  const rawCorpusPath = path.join(__dirname, '../', 'corpus.txt');
  const rawCorpusBuffer = await readFile(rawCorpusPath);
  const rawCorpus = rawCorpusBuffer.toString('utf-8');

  console.log('build initial corpus...');
  // corpus.push(rawCorpus);

  app
    .get('/', (req, res) => res.json(corpus.generate()))
    .listen(3030, () => console.log('app started'));
};

main().catch(() => null);
