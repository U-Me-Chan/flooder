import Markov from 'markov-strings';
import { TextRefactor } from './TextRefactor';

const MARKOV_STRINGS_STATE_SIZE = 2;
const MARKOV_STRINGS_MAX_TRIES = 100000;

export class Corpus {
  refactor: TextRefactor;
  markov: Markov;

  constructor() {
    this.refactor = new TextRefactor();
    this.markov = new Markov({ stateSize: MARKOV_STRINGS_STATE_SIZE });
  }

  push(text: string) {
    this.markov.addData(this.refactor.clean(text));
  }

  generate() {
    const generated = this.markov.generate({
      maxTries: MARKOV_STRINGS_MAX_TRIES,
      filter: (result) => {
        return result.refs.length > 5;
      },
    });

    return generated.string;
  }
}
