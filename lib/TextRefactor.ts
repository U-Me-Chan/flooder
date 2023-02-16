export class TextRefactor {
  clean(text: string): string[] {
    return text.split('\n')
      .reduce((acc, cur) => ([...acc, ...cur.split('.')]), [] as string[])
      .map(str => str.trim())
      .map(str => str.split('\t').join(' '))
      .map(str => str.split(' ').filter(_ => _.length > 0).join(' '))
      .filter(str => Boolean(str))
      .filter(str => str.length > 10)
      .map(str => str.trim())
      .filter(str => str.length > 10)
      .map(str => str.replace('— ', '')
        .replace('- ', '')
        .replace('> ', '')
      );
  }
}
