import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl } from './form-control';

const formId = `#wf-form-Wycena-Przesy-ki`;
const selector = `${formId} #FS2 + div`;

export class AddressForm {
  private controls = [
    new FormControl<string>('fromAddress', `${selector} input[name="Adres-za-adunku"]`),
    new FormControl<string>('fromCity', `${selector} input[name="Miejscowo-za-adunku"]`),
    new FormControl<string>('fromPostcode', `${selector} input[name="Kod-pocztowy-za-adunku"]`),
    new FormControl<string>('toAddress', `${selector} input[name="Adres-roz-adunku"]`),
    new FormControl<string>('toCity', `${selector} input[name="Miejscowo-roz-adunku"]`),
    new FormControl<string>('toPostcode', `${selector} input[name="Kod-pocztowy-roz-adunku"]`),
  ];

  initialize() {
    this.controls.forEach((ctrl) => {
      const value = localStorage.getItem(`goasap-Address-${ctrl.name}`);
      if (value) {
        ctrl.setValue(value);
      }
    });

    merge(...this.controls.map((ctrl) => ctrl.value$.pipe(map((value) => ({ value, name: ctrl.name })))))
      .pipe(map((ctrl) => localStorage.setItem(`goasap-Address-${ctrl.name}`, ctrl.value)))
      .subscribe();
  }
}
