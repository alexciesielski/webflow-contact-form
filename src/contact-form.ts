import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl } from './form-control';

const formId = `#wf-form-Wycena-Przesy-ki`;
const selector = `${formId} #FS3 + div`;

export class ContactForm {
  private controls = [
    new FormControl<string>('fromCompanyName', `${selector} input[name="Nazwa-firmy-za-adunek"]`),
    new FormControl<string>('fromFirstName', `${selector} input[name="Imi-nadawcy"]`),
    new FormControl<string>('fromSurname', `${selector} input[name="Nazwisko-nadawcy"]`),
    new FormControl<string>('fromPhone', `${selector} input[name="Telefon-nadawcy"]`),
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
