export class TextRefactor {
  clean(text: string): string[] {
    return text.split('\n')
      .reduce((acc, cur) => ([...acc, ...cur.split('.')]), [] as string[])
      .map(str => str.trim())
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
