import { PrismaClient } from '@prisma/client';

const getRandom = (max: number) => {
  const rand = Math.round(Math.random() * (max - 1) + 1);
  return rand === max ? rand - 1 : rand;
}

type ListNode = {
  id: number;
  value: string;
  parent: string;
  next?: ListNode[];
};

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

  async genTree(parent: string = '__START__', step: number = 1, words: number = 10, treeSize: number = 2, traceId: string = 'S.I'): Promise<ListNode[] | undefined> {
    console.log(`Core: tree-gen, traceId: ${traceId}`);
    const result: ListNode[] = [];

    if (step === words) {
      return undefined;
    }

    if (parent === '__END__') {
      return undefined;
    }

    const nextWords = await this.prisma.word.findMany({ where: { parent } });

    for (let i = 0; i < (step === 1 ? 1 : treeSize); i++) {
      const nextWord = nextWords[getRandom(nextWords.length)];
      result.push({
        id: nextWord.id,
        parent,
        value: nextWord.content,
        next: await this.genTree(nextWord.content, step + 1, words, treeSize, `${traceId}-${i}.${step}`),
      });
    }

    return result;
  }

  flattenTree(tree: ListNode[]): string[] {
    const result: string[] = [];

    tree.forEach((node) => {
      let siblings: string[] = [];

      if (node.next?.length) {
        siblings = this.flattenTree(node.next);
      }

      if (!siblings.length) {
        result.push(node.value === '__END__' ? '' : node.value);
      } else {
        siblings.forEach(_ => result.push(`${node.value} ${_}`));
      }
    })

    return result;
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