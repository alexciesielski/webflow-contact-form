import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { number$, select$, text$ } from './form-util';

export class FormControl<T extends string | number = number> {
  constructor(readonly name: string, private readonly selector: string, type: 'string' | 'number' = 'number') {
    console.debug(`[FormControl.ctor]: `, name, selector);
  }

  private readonly element = document.querySelector(this.selector) as HTMLFormElement | undefined;
  private readonly type = this.element?.getAttribute('type') ?? null;

  readonly value$ = (
    (isInput(this.element)
      ? this.type === 'number'
        ? number$(this.selector)
        : text$(this.selector)
      : select$(this.selector)) as Observable<T>
  ).pipe(
    map((value) => value as T),
    tap((value) => console.debug(`[FormControl."${this.name}"]: value`, value)),
  );

  getValue() {
    const el = this.element;
    if (isInput(el)) {
      return (this.type === 'number' ? el.valueAsNumber : el.value) as T;
    } else if (isSelect(el)) {
      return el.selectedIndex as T;
    }

    throw new Error(`Expected "${this.name} (${this.selector})" to be a valid form control`);
  }

  setValue(value: T): void {
    console.debug(`[FormControl.${this.name}]: setValue(${value})`);
    const el = this.element;
    if (isInput(el)) {
      if (typeof value === 'string') {
        el.value = value;
        return;
      } else if (typeof value === 'number') {
        el.valueAsNumber = value;
        return;
      }
    } else if (isSelect(el)) {
      if (typeof value === 'number') {
        el.selectedIndex = value;
        return;
      }
    }

    throw new Error(`Could not set value "${value}" on element "${this.name} (${this.selector})"`);
  }
}

export function isInput(node?: Node): node is HTMLInputElement {
  return node instanceof HTMLInputElement;
}

export function isSelect(node?: Node): node is HTMLSelectElement {
  return node instanceof HTMLSelectElement;
}
