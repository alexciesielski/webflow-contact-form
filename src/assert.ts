export function assertNonNullable<T>(val: T, errorMessage?: string): asserts val is NonNullable<T> {
  if (val === null || val === undefined) {
    throw new Error(errorMessage || `Expected variable to be defined, but received ${val}`);
  }
}

export function assertIsError<T extends Error = Error>(error: unknown): asserts error is T {
  if (!(error instanceof Error)) {
    throw error;
  }
}
