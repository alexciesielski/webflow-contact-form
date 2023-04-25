import { Subject, combineLatest, fromEvent } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { calculateShippingPrice } from './calculate-shipping-price';
import { debounce } from './debounce';

const ZA_WYSOKA_CENA = 2500;
const ZA_WYSOKA_CENA_MESSAGE = 'Prosimy o kontakt';

function setPriceOutput(price) {
  let textContent = `${price.toFixed(2)} zł`;

  if (price >= ZA_WYSOKA_CENA) {
    textContent = ZA_WYSOKA_CENA_MESSAGE;
  }

  document.querySelector('#price')!.textContent = textContent;
}

const debouncedSetPriceOutput = debounce(setPriceOutput, 500);

setTimeout(() => {
  const reset$ = new Subject();

  // @return Observable<{ wysokosc: number, waga: number, ilosc: number, type: string }>
  function getValues(node) {
    const select = node.querySelector('select');
    const inputs = node.querySelectorAll('input') as HTMLInputElement[];

    const idToKey = {
      Wysoko: 'wysokosc',
      Waga: 'waga',
      Ilo: 'ilosc',
    };

    const getInputKey = (input) => {
      const dataName = input.getAttribute('data-name');
      return Object.entries(idToKey).reduce((name, [id, key]) => {
        if (dataName?.startsWith(id)) {
          return key;
        }

        return name;
      }, '');
    };

    const inputs$ = combineLatest(
      Array.from(inputs).map((input) =>
        fromEvent(input, 'input').pipe(
          startWith(0),
          map(() => input.valueAsNumber ?? 0),
          map((value) => (Number.isNaN(value) ? 0 : value)),
          map((value) => ({ [getInputKey(input)]: value })),
        ),
      ),
    ).pipe(
      map((values) =>
        values.reduce(
          (all, value) => ({
            ...all,
            ...value,
          }),
          {},
        ),
      ),
    );

    const select$ = fromEvent(select, 'change').pipe(
      startWith(select.selectedIndex),
      map(() => select.selectedIndex),
      map((value) => ({ typ: value })),
    );

    return combineLatest([inputs$, select$]);
  }

  const insuranceInput = document.querySelector('.data-input.insurance')! as HTMLInputElement;
  const insurance$ = fromEvent(document.querySelector('.data-input.insurance')!, 'input').pipe(
    map(() => insuranceInput.value),
    tap((insurance) => console.log('insurance', insurance)),
    startWith(0),
  );

  combineLatest([reset$, insurance$])
    .pipe(
      switchMap(() => {
        const rows = document.querySelectorAll('#srow');
        return combineLatest(Array.from(rows).map((row) => getValues(row)));
      }),
      map((values) => values.map((value) => value.reduce((finalValue, value) => ({ ...finalValue, ...value }), {}))),
      map((values) => {
        return values.map((value) => {
          const { waga, ilosc, typ } = value as { waga: number; ilosc: number; typ: number };
          return calculateShippingPrice(typ, ilosc, waga, Number(insuranceInput.value));
        });
      }),
      map((values) => values.reduce((sum, current) => (sum += current), 0)),
      startWith(0),
      tap((sum) => debouncedSetPriceOutput(sum)),
    )
    .subscribe();

  reset$.next();

  function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
  }

  let counter = 1;
  document.querySelector('#btn-duplicate')!.addEventListener('click', () => {
    const row = document.querySelector('[initial-row="0"]') as HTMLElement;
    const node = row.cloneNode(true)! as HTMLElement;

    node.setAttribute('initial-row', `${counter}`);
    insertAfter(node, document.querySelector(`[initial-row="${counter - 1}"]`));

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
      // input.value = undefined;
    });

    const btnDelete = node.querySelector('#btn-delete') as HTMLElement;
    btnDelete.style.opacity = '1';
    btnDelete.addEventListener('click', () => {
      counter--;
      node.remove();
      reset$.next();
    });

    setTimeout(() => {
      reset$.next();
    }, 1);
  });
}, 1000);
