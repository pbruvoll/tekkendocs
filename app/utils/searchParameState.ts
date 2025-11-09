import { type SearchParamsChanges } from '~/types/SearchParamsChanges';

export class SearchParamsState {
  private remove_: string[] = [];
  private set_: { key: string; value: string }[] = [];
  public set(key: string, value: string) {
    this.set_.push({ key, value });
  }
  public remove(key: string) {
    this.remove_.push(key);
  }
  public getChanges(): SearchParamsChanges {
    return {
      set: this.set_,
      remove: this.remove_,
    };
  }
}
