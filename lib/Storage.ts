export class Storage {
  private fetchedIds: string[] = [];

  async addFetched(id: string) {
    this.fetchedIds.push(id);
  }

  async checkIsFetched(id: string): Promise<boolean> {
    return this.fetchedIds.includes(id);
  }
}
