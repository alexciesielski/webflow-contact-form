import { Observable, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { assertNonNullable } from './assert';

export function number$(selector: string): Observable<number> {
  const element = document.querySelector(selector) as HTMLInputElement;
  assertNonNullable(element, `Expected "${selector}" to be defined`);
  return fromEvent(element, 'input').pipe(
    startWith(0),
    map(() => element.valueAsNumber),
  );
}

export function select$(selector: string): Observable<number> {
  const element = document.querySelector(selector) as HTMLSelectElement;
  assertNonNullable(element, `Expected "${selector}" to be defined`);
  return fromEvent(element, 'change').pipe(
    startWith(0),
    map(() => element.selectedIndex),
  );
}
