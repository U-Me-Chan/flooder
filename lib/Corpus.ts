import Markov from 'markov-strings';
import { TextRefactor } from './TextRefactor';
import { writeFile, readFile } from 'fs/promises';

const MARKOV_STRINGS_STATE_SIZE = 2;
const MARKOV_STRINGS_MAX_TRIES = 100000;
const MIN_REFERENCES_COUNT = 5;
const MODEL_FILEPATH = 'storage/model.json';

export class Corpus {
  private refactor: TextRefactor;
  private markov: Markov;

  constructor() {
    this.refactor = new TextRefactor();
    this.markov = new Markov({ stateSize: MARKOV_STRINGS_STATE_SIZE });
  }

  public async saveModel() {
    const model = this.markov.export();
    await writeFile(MODEL_FILEPATH, JSON.stringify(model));
  }

  public async loadModel() {
    const model = JSON.parse(
      (await readFile(MODEL_FILEPATH)).toString()
    );

    this.markov.import(model);
  }

  public push(text: string) {
    console.log('Adding new corpus to model');
    this.markov.addData(this.refactor.clean(text));
  }

  public generate() {
    const generated = this.markov.generate({
      maxTries: MARKOV_STRINGS_MAX_TRIES,
      filter: (result) => {
        return result.refs.length > MIN_REFERENCES_COUNT;
      },
    });

    return generated.string;
  }
}
