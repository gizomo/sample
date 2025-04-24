import BindValidate from './bind-validate';
import EventListener from './event-listener';
import _ from 'lodash';
import {Mixin} from './helpers';

export type ValuesType = Record<string, any>;
export type ErrorsType = Record<string, string>;
export type SubscribeType = {field: string; instance: BindValues};
export type PayloadType = {field: string; instance: BindValues; value: any; prevValue: any};
export type FieldType = Record<string, (option: any) => Date | number | string> | string;
export type ValidateRules = Record<string, string[] | string>;

export enum BindValuesEvents {
  CHANGE = 'change',
  ERROR = 'error',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  INVALID = 'invalid',
}

interface BindValues extends EventListener, BindValidate {}

@Mixin([BindValidate])
class BindValues extends EventListener {
  [x: string]: any;

  private attributes: ValuesType = {};
  private originalAttributes: ValuesType = {};
  private processed: boolean = false;
  private errors: ErrorsType = {};
  private formatters: Record<string, (value: any) => any> = {};
  private validateRules: ValidateRules = {};
  private fieldValueGetter: FieldType = {};

  constructor(values: ValuesType, errors: ErrorsType = {}) {
    super();

    this.attributes = values;
    this.originalAttributes = _.clone(values);
    this.errors = errors;
  }

  public get(field: string): any {
    return this.attributes[field];
  }

  public set(field: string, value: any): void {
    if (this.formatters[field]) {
      value = this.formatters[field](value);
    }

    const payload: PayloadType = {
      field,
      value,
      prevValue: _.clone(this.get(field)),
      instance: this,
    };

    this.setAttribute(field, value);
    this.performFireEvent(BindValuesEvents.CHANGE, payload);
  }

  public has(field: string): boolean {
    return this.hasOwnProperty(field);
  }

  public getError(field: string): string {
    if (!this.hasError(field)) {
      return '';
    }

    return this.errors[field];
  }

  public getErrors(): Record<string, string> {
    return this.errors;
  }

  public getFirstErrorField(): string {
    return Object.entries(this.getErrors()).find((pair: [string, string]) => pair[1])[0];
  }

  public setError(field: string, value: string): void {
    const payload: PayloadType = {
      field,
      value,
      prevValue: _.clone(this.errors[field]),
      instance: this,
    };

    this.errors[field] = value;
    this.performFireEvent(BindValuesEvents.ERROR, payload);
  }

  public setErrors(errors: ErrorsType): void {
    this.errors = errors;
  }

  public hasError(field?: string): boolean {
    if (undefined === field) {
      return Object.keys(this.errors).some((field: string) => Boolean(this.errors[field]));
    }

    return this.errors.hasOwnProperty(field) && Boolean(this.errors[field]);
  }

  public setFormatter(field: string, formatter?: (value: any) => any): void {
    this.formatters[field] = formatter;
  }

  public hasChanged(field?: string): boolean {
    if (undefined === field) {
      return Object.keys(this.originalAttributes).some((field: string) => this.originalAttributes[field] !== this.attributes[field]);
    }

    return this.originalAttributes[field] !== this.attributes[field];
  }

  public toObject(): any {
    return this.attributes;
  }

  public keys(): string[] {
    return Object.keys(this.attributes);
  }

  public forEach(callback: (field: string, value: any) => void): void {
    this.keys().forEach((key: string) => {
      callback(key, this.attributes[key]);
    });
  }

  public invalid(): void {
    this.performFireEvent(BindValuesEvents.INVALID);
  }

  public submit(): void {
    this.originalAttributes = _.clone(this.attributes);
    this.performFireEvent(BindValuesEvents.SUBMIT);
  }

  public cancel(): void {
    this.attributes = _.clone(this.originalAttributes);
    this.performFireEvent(BindValuesEvents.CANCEL);
  }

  /**
   * Validators:
   * , - operator &&
   * | - operator ||
   * 'required,email|phone,integer' --> required and (email or phone) and integer
   *
   * Examples:
   * 'required,integer'          - field is required and must be an integer number
   * ['required', 'integer']     - field is required and must be an integer number (array form)
   * 'not_empty:password-repeat' - current field forces fill in password-repeat field
   * 'email|phone'               - field has to be an email or phone
   */
  public use(field: FieldType, validates?: string[] | string, formatter?: (value: any) => any): SubscribeType {
    let fieldName: string;

    if ('string' === typeof field) {
      fieldName = field;
    } else {
      fieldName = Object.keys(field)[0];
      this.fieldValueGetter[fieldName] = field[fieldName];
    }

    this.validateRules[fieldName] = validates;
    this.formatters[fieldName] = formatter;

    return {
      field: fieldName,
      instance: this,
    };
  }

  private getValue(field: string, value: any): Date | number | string {
    if (undefined === this.fieldValueGetter[field]) {
      return value;
    }

    return this.fieldValueGetter[field](value);
  }

  protected performFireEvent(event: string, payload?: PayloadType): void {
    this.processed = true;
    this.fireEvent(event, payload);
    this.processed = false;
  }

  public isProcessed(): boolean {
    return this.processed;
  }

  public setAttribute(field: string, value: any): void {
    this.attributes[field] = this.getValue(field, value);

    if (this.hasOwnProperty(field)) {
      return;
    }

    Object.defineProperty(this, field, {
      get: () => {
        return this.attributes[field];
      },
      set: (value: any) => {
        if (undefined !== value) {
          throw Error(`Error set "${field}" field. Please use .set(field, value)`);
        }
      },
    });
  }
}

export default BindValues;
