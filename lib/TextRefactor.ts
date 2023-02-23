// @ts-ignore
import * as Az from 'az';

export class TextRefactor {
  normalize(text: string) {
    return Az.Tokens(text.split('\n').map(_ => _.trim()).filter(_ => _.length > 0).join('.')).done(['WORD', 'PUNCT'])
      .map((_: any, index: number, origin: any[]) => origin[index - 1]?.type === _.type && _.type.toString() === 'PUNCT' ? undefined : _)
      .filter((_: any) => _ !== undefined)
      .map((_: any) => _.source.slice(_.st, _.st + _.length))
      .join(' ')
      .split(' : ').join(': ')
      .split(' . ').join('. ')
      .split(' , ').join(', ')
      .split(' ( ').join(' (')
      .split(' ) ').join(') ')
      .split(' « ').join(' «')
      .split(' » ').join('» ')
      .split(' ! ').join('! ')
      .split(' ? ').join('? ')
      .split(' " ').join(' ') as string;
  }

  splitToUniqueSentences(raw: string) {
    let text: string[] = [];
    text = raw.split('. ').join('.\n').split('! ').join('!\n').split('? ').join('?\n').split('\n');
    return [...new Set(text)];
  }

  clean(text: string): string[] {
    return this.splitToUniqueSentences(this.normalize(text));
  }
}
