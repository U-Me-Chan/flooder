import { readFile, writeFile } from 'fs/promises';

const main = async () => {
  const rawBuffer = await readFile('corpus/rasta-tales-raw.txt');
  const raw = rawBuffer.toString();

  const cleaned = raw
    .split('\n')
    .map(_ => _.split('«').join(''))
    .map(_ => _.split('»').join(''))
    .map(_ => _.trim())
    .map(_ => _.split(' ').filter(_ => _.length > 0).join(' '))
    .map(_ => {
      if (
        _.split('').every(_ => _ === _.toUpperCase())
      ) {
        const [first, ...other] = _.toLowerCase();
        return `${first?.toUpperCase() || ''}${other?.join('') || ''}`;
      }

      return _;
    })
    .filter(_ => _.length > 3)
    .join('\n');

  await writeFile('corpus/rasta-tales.txt', cleaned);
}

main();
