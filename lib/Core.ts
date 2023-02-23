import { PrismaClient } from '@prisma/client';

const getRandom = (max: number) => {
  const rand = Math.round(Math.random() * (max - 1) + 1);
  return rand === max ? rand - 1 : rand;
}

export class Core {
  prisma = new PrismaClient();

  makePairs(data: string[]): [string, string][] {
    const pairs: [string, string][] = [];

    for (let i = 0; i <= data.length - 2; i++) {
      pairs.push([data[i], data[i+1]]);
    }

    return pairs;
  }

  async push(data: string[]) {
    const time = Date.now();
    const wrapped = ['__START__', ...data, '__END__'];
    const pairs: [string, string][] = this.makePairs(wrapped);

    for (const pair of pairs) {
      const [parent, content] = pair;

      try {
        await this.prisma.word.create({ data: { content, parent, stamp: `${parent}-${content}`, weight: 1 } });
      } catch {
        // skip
      }
    }

    console.log(`Core: Pushed ${pairs.length} pairs, ${Date.now() - time}ms`);
  }

  async gen(words: number = 10) {
    let currentWord = 1;
    let parent = '__START__';
    let result: string[] = [];

    while (currentWord !== words || parent !== '__END__') {
      const nextWords = await this.prisma.word.findMany({ where: { parent } });
      const nextWord = nextWords[getRandom(nextWords.length)];

      if (!nextWord) {
        parent = '__END__';
        currentWord = words;
      } else {
        result.push(nextWord.content);
        parent = nextWord.content;
        currentWord += 1;
      }
    }

    return result.filter(_ => _ !== '__END__');
  }
}