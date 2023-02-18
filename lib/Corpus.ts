import Markov from 'markov-strings';
import { TextRefactor } from './TextRefactor';
import { writeFile, readFile } from 'fs/promises';
import { config } from './config';

export class Corpus {
  private refactor: TextRefactor;
  markov: Markov;

  constructor() {
    this.refactor = new TextRefactor();
    this.markov = new Markov({ stateSize: config.corpus.markovStrings.stateSize });
  }

  public async saveModel() {
    console.log('Corpus: Save model to FS');

    const model = this.markov.export();
    await writeFile(config.corpus.modelFilePath, JSON.stringify(model));
  }

  public async loadModel() {
    console.log('Corpus: Load model from FS');

    const model = JSON.parse(
      (await readFile(config.corpus.modelFilePath)).toString()
    );

    this.markov.import(model);
  }

  public push(text: string) {
    console.log('Corpus: Adding new text to model');

    const cleaned = this.refactor.clean(text);

    if (cleaned.length > 0) {
      this.markov.addData(this.refactor.clean(text));
    }    
  }

  public generate() {
    console.log('Corpus: New request for text generation');

    const generated = this.markov.generate({
      maxTries: config.corpus.markovStrings.generateMaxTries,
      filter: (result) => {
        return result.refs.length > config.corpus.markovStrings.generateMinRefCount;
      },
    });

    return generated.string;
  }
}
