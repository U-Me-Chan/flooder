import { Core } from './Core';
import { TextRefactor } from './TextRefactor';

export class Corpus {
  private refactor: TextRefactor;
  markov: Core;

  constructor() {
    this.refactor = new TextRefactor();
    this.markov = new Core();
  }

  public async push(text: string) {
    console.log('Corpus: Adding new text to model');

    const cleaned = this.refactor.clean(text);

    if (cleaned.length > 0) {
      for (const sentens of cleaned) { 
        await this.markov.push(sentens.split(' '));
      }
    }
  }

  public async generate() {
    console.log('Corpus: New request for text generation');
    return await this.markov.gen(20);
  }
}
