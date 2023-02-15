import path from 'path';
import { readFile } from 'fs/promises';

import express from 'express';

const { Chain } = require('markov-chainer');

const corpusPath = path.join(__dirname, '../', 'corpus.txt');

const cleanCorpus = (rawText: string): string[][] => {
  return rawText.split('\n')
    .reduce((acc, cur) => ([...acc, ...cur.split('.')]), [] as string[])
    .map(str => str.trim())
    .filter(str => Boolean(str))
    .filter(str => str.length > 10)
    .map(str => str.trim())
    .filter(str => str.length > 10)
    .map(str => str.replace('— ', '')
      .replace('- ', '')
      .replace('> ', '')
    )
    .map(str => str.split(' ')
      .filter(chunk => chunk !== '')
    )
    .filter(chunks => chunks.length >= 3);
}

readFile(corpusPath)
  .then(buffer => Promise.resolve(buffer.toString()))
  .then(rawCorpus => Promise.resolve([cleanCorpus(rawCorpus), rawCorpus]))
  .then(([corpus, raw]) => {
    const chain = new Chain({ corpus });

    const create = (runs: number = 5) => {
      let result = '';
      for (let i = 0; i < runs; i++) {
        if (result === '') {
          const [_ignore0, _ignore1, res] = chain.run({ tokens: [] });
          result = res.join(' ');
        } else {
          const [_ignore0, _ignore1, res] = chain.run({ tokens: result.split(' ') });
          result += '. ' + res.join(' ');
        }
      }

      return Promise.resolve(result);
    }

    const app = express();
    app.get('/', (req, res) => {
      create(Number(req.query.runs || '5'))
        .then(result => res.json(result))
        .finally(() => res.end());
    });
    app.listen(3030);
  });
