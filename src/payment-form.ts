import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl } from './form-control';

const formId = `#wf-form-Wycena-Przesy-ki`;
const selector = `${formId} #FS4 + div`;

export class PaymentForm {
  private controls = [
    new FormControl<string>('nip', `${selector} input[name="NIP-P-atnika"]`),
    new FormControl<string>('name', `${selector} input[name="Imi-p-atnika"]`),
    new FormControl<string>('surname', `${selector} input[name="Nazwisko-p-atnika"]`),
    new FormControl<string>('email', `${selector} input[name="Telefon-nadawcy-2"]`),
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
