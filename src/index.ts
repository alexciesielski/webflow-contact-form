import { debounceTime, map, tap } from 'rxjs/operators';
import packageJson from '../package.json';
import { AddressForm } from './address-form';
import { PaletaConfig, calculateRow, validatePalety } from './calculate-shipping-price';
import { ContactForm } from './contact-form';
import { PaymentForm } from './payment-form';
import { QuoteForm } from './quote-form';

declare const window: {
  quote?: {
    DISABLED?: boolean;
    ZA_WYSOKA_CENA?: number;
    ZA_WYSOKA_CENA_MESSAGE?: string;
    WARTOSCI?: Partial<PaletaConfig>;
  };
};

// <script type="text/javascript" >
// window.quote = {
//   ZA_WYSOKA_CENA: 2500,
//   ZA_WYSOKA_CENA_MESSAGE: 'Prosimy o kontakt',
//   WARTOSCI: {
//     ZMIENNA_WARTOSC_PROCENT: 15.75,
//     UBEZPIECZENIE_PROCENT: 0.17,
//     VAT_PROCENT: 23,
//     PALETA_TYPE_EURO: {
//       Do_400_kilo: 160,
//       Do_800_kilo: 190,
//       Do_1000_kilo: 218.75,
//     },
//     PALETA_TYPE_PRZEMYSLOWA: {
//       Do_400_kilo: 190,
//       Do_800_kilo: 218.75,
//       Do_1000_kilo: 241.25,
//     },
//     PALETA_TYPE_PRZEMYSLOWA_PLUS: {
//       Do_400_kilo: 190,
//       Do_800_kilo: 218.75,
//       Do_1000_kilo: 241.25,
//     },
//     PALETA_TYPE_POLPALETA: {
//       Do_200_kilo: 145,
//     },
//   },
// };
// </script>

const PALETY: PaletaConfig = {
  ZMIENNA_WARTOSC_PROCENT: window.quote?.WARTOSCI?.ZMIENNA_WARTOSC_PROCENT ?? 0,
  UBEZPIECZENIE_PROCENT: window.quote?.WARTOSCI?.UBEZPIECZENIE_PROCENT ?? 0,
  VAT_PROCENT: window.quote?.WARTOSCI?.VAT_PROCENT ?? 0,

  PALETA_TYPE_EURO: {
    Do_400_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_EURO?.Do_400_kilo ?? 0,
    Do_800_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_EURO?.Do_800_kilo ?? 0,
    Do_1000_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_EURO?.Do_1000_kilo ?? 0,
    Do_1200_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_EURO?.Do_1200_kilo ?? 0,
  },

  PALETA_TYPE_PRZEMYSLOWA: {
    Do_400_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA?.Do_400_kilo ?? 0,
    Do_800_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA?.Do_800_kilo ?? 0,
    Do_1000_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA?.Do_1000_kilo ?? 0,
    Do_1200_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA?.Do_1200_kilo ?? 0,
  },

  PALETA_TYPE_PRZEMYSLOWA_PLUS: {
    Do_400_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA_PLUS?.Do_400_kilo ?? 0,
    Do_800_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA_PLUS?.Do_800_kilo ?? 0,
    Do_1000_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA_PLUS?.Do_1000_kilo ?? 0,
    Do_1200_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_PRZEMYSLOWA_PLUS?.Do_1200_kilo ?? 0,
  },

  PALETA_TYPE_POLPALETA: {
    Do_200_kilo: window.quote?.WARTOSCI?.PALETA_TYPE_POLPALETA?.Do_200_kilo ?? 0,
  },
};

try {
  console.debug(`[validatePalety]: version`, packageJson.version);
} catch (err) {
  console.error('could not print package.json version');
}

console.debug(`[validatePalety]: quote config`, window.quote);
const valid = validatePalety(PALETY);
console.debug(`[validatePalety]: valid`, valid, PALETY);

if (valid && !window.quote?.DISABLED) {
  const ZA_WYSOKA_CENA = window.quote?.ZA_WYSOKA_CENA ?? 2500;
  const ZA_WYSOKA_CENA_MESSAGE = window.quote?.ZA_WYSOKA_CENA_MESSAGE ?? 'Prosimy o kontakt';

  setTimeout(() => {
    new QuoteForm().value$
      .pipe(
        map(({ rows, insurance }) =>
          rows.map((row) => calculateRow(PALETY, { ...row, insurance })).reduce((sum, row) => sum + row, 0),
        ),
        debounceTime(250),
        tap((price) => console.debug(`[QuoteForm]: price`, price)),
        map((price) => (price >= ZA_WYSOKA_CENA ? ZA_WYSOKA_CENA_MESSAGE : `${price.toFixed(2)} zł`)),
        tap((price) => console.debug(`[QuoteForm]: price label`, price)),
        tap((price) => (document.querySelector('#price')!.textContent = price)),
      )
      .subscribe();

    new AddressForm().initialize();
    new ContactForm().initialize();
    new PaymentForm().initialize();
  }, 1000);
}
