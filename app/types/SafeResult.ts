export type SafeResult<T, U> =
  | {
      success: true;
      result: T;
    }
  | {
      success: false;
      error: U;
    };
