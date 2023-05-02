import { Observable, Subject, combineLatest, merge } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormControl } from './form-control';
import { FORM_ID } from './form-id';
import { insertNodeAfter } from './insert-node-after';

const selector = `${FORM_ID} #Step1 + div`;
let counter = 1;

export interface QuoteFormRowValue {
  type: number;
  height: number;
  weight: number;
  qty: number;
}

export interface QuoteFormValue {
  insurance: number;
  rows: Array<QuoteFormRowValue>;
}

export class QuoteForm {
  constructor() {
    setTimeout(() => this.initialize(), 5);
  }

  private readonly initializeForm$$ = new Subject();

  private readonly rows: Array<Array<FormControl<number>>> = [this.getFormRow(0)];
  private readonly insuranceInput: FormControl = new FormControl('insurance', `${selector} .data-input.insurance`);

  readonly value$: Observable<QuoteFormValue> = combineLatest([
    this.initializeForm$$.pipe(
      map(() => this.rows),
      map((rows) => rows.map((elements) => elements.map((element) => element.value$)).flat(2)),
      switchMap((obs) => merge(...obs)),
      map((xxx) => this.rows),
    ),
    this.insuranceInput.value$,
  ]).pipe(
    map(([rows, insurance]) => {
      const rowValues = rows.map((row) =>
        row.reduce((values, ele) => {
          values[ele.name] = ele.getValue();
          return values;
        }, {} as QuoteFormRowValue),
      );

      return {
        insurance,
        rows: rowValues,
      };
    }),
    tap((value) => console.debug(`[QuoteForm]: value`, value)),
  );

  initialize() {
    console.debug(`[QuoteForm]. initialize()`);
    document.querySelector(`${selector} #btn-duplicate`)!.addEventListener('click', () => {
      this.addRow();
      setTimeout(() => this.initializeForm(), 1);
    });

    this.initializeForm();
  }

  initializeForm() {
    console.debug(`[QuoteForm]: initializeForm()`);
    this.initializeForm$$.next();
  }

  addRow() {
    console.debug(`[QuoteForm]: addRow()`);
    const row = document.querySelector('[initial-row="0"]') as HTMLElement;
    const node = row.cloneNode(true)! as HTMLElement;

    node.setAttribute('initial-row', `${counter}`);
    insertNodeAfter(node, document.querySelector(`[initial-row="${counter - 1}"]`)!);
    this.rows.push(this.getFormRow(counter));

    const newId = ++counter;

    node.querySelectorAll('input').forEach((input) => {
      input.setAttribute('data-name', `${input.getAttribute('data-name')} ${newId}`);
      input.setAttribute('name', `${input.getAttribute('name')} ${newId}`);
      input.setAttribute('id', `${input.getAttribute('id')} ${newId}`);
      input.value = '';
    });

    node.querySelectorAll('select').forEach((input) => {
      input.setAttribute('data-name', `${input.getAttribute('data-name')} ${newId}`);
      input.setAttribute('name', `${input.getAttribute('name')} ${newId}`);
      input.setAttribute('id', `${input.getAttribute('id')} ${newId}`);
    });

    const btnDelete = node.querySelector('#btn-delete') as HTMLElement;
    btnDelete.style.opacity = '1';
    btnDelete.addEventListener('click', () => this.deleteRow(node));
  }

  deleteRow(node: HTMLElement) {
    counter--;
    node.remove();
    this.rows.splice(counter, 1);

    this.initializeForm();
    console.debug(`[QuoteForm]: deleteRow(${counter})`, this.rows);
  }

  private getFormRow(index: number): Array<FormControl<number>> {
    console.debug(`[QuoteForm]: getFormRow(${index})`);
    const rowSelector = `${selector} [initial-row="${index}"]`;
    const typeSelect = new FormControl('type', `${rowSelector} select`);
    const heightInput = new FormControl('height', `${rowSelector} input#Wysoko`);
    const weightInput = new FormControl('weight', `${rowSelector} input#Waga`);
    const qtyInput = new FormControl('qty', `${rowSelector} input#Ilo`);

    return [typeSelect, heightInput, weightInput, qtyInput];
  }
}
