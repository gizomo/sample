import _ from 'lodash';
import {PhoneFormatter} from './phone-formatter';
import {interpolate, isEmpty} from './helpers';

export type RulesOverride = {[rule: string]: string};
export type BindValidators = {[rule: string]: (value1: any, value2?: any, self?: BindValidate) => boolean | undefined};

export default class BindValidate {
  [x: string]: any;

  private static validateErrors: RulesOverride = {
    required: 'validate.required',
    or: 'validate.or',
    not_empty: 'validate.not_empty',
    number: 'validate.number',
    integer: 'validate.integer',
    positive: 'validate.positive',
    only_integer: 'validate.only_integer',
    url: 'validate.url',
    email: 'validate.email',
    ipv4: 'validate.ipv4',
    same_value: 'validate.same_value',
    min_length: 'validate.min_length::{"min":"{{condition}}"}',
    max_length: 'validate.max_length::{"max":"{{condition}}"}',
    alpha_numeric: 'validate.alpha_numeric',
    phone: 'validate.phone',
  };

  private static validators: BindValidators = {
    success: (): boolean => true,
    nullable: (value: any): boolean => isEmpty(value),
    required: (value: any): boolean =>
      typeof value === 'object'
        ? Object.keys(value).length > 0 || value instanceof File
        : -1 === ['', 'NaN', 'undefined', 'null'].indexOf(_.toString(value).trim()),
    not_empty: (value1: any, value2: any): boolean => {
      if (!BindValidate.validators.required(value1)) {
        return true;
      }

      return BindValidate.validators.required(value2);
    },
    or: (value1: any, value2: any): boolean => {
      return (BindValidate.validators.required(value1) && value1) || (BindValidate.validators.required(value2) && value2);
    },
    same_value: (value1: any, value2: any): boolean => {
      return value1 === value2;
    },
    min_length: (value: any[], length: number | string): boolean => value.length >= _.toInteger(length),
    max_length: (value: any[], length: number | string): boolean => value.length <= _.toInteger(length),
    time4: (value: string): boolean => {
      if (!BindValidate.validators.required(value)) {
        return false;
      }

      const [hours, minutes]: string[] = value.split(':');

      return BindValidate.validators.integer(hours) && BindValidate.validators.integer(minutes);
    },
    number: (value: number | string): boolean => {
      if (!BindValidate.validators.required(value)) {
        return false;
      }

      return _.toString(value) === _.toString(_.toNumber(value));
    },
    integer: (value: number | string): boolean => {
      if (!BindValidate.validators.required(value)) {
        return false;
      }

      let trimInt: string = _.trimStart(_.toString(value), '0');

      if ('00' === value || '0' === value || 0 === value) {
        trimInt = '0';
      }

      return _.toString(trimInt) === _.toString(_.toInteger(trimInt));
    },
    positive: (value: number | string): boolean => {
      if (!BindValidate.validators.number(value)) {
        return false;
      }

      return _.toNumber(value) > 0;
    },
    only_integer: (value: number | string): boolean => {
      if (!BindValidate.validators.required(value)) {
        return false;
      }

      const valueString: string = _.toString(value);

      return /^([\d])+$/.test(valueString);
    },

    alpha_numeric: (value: string): boolean => /^[a-zA-Z0-9_]*$/.test(value),
    phone: (value: string): boolean => PhoneFormatter.validatePhoneNumber(value),

    url: (value: string): boolean => /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(value),
    email: (value: string): boolean =>
      /^[\w\-\.]+@\s*(?!.*?_.*?)(?!(?:[\d\w]+?\.)?\-[\w\d\.\-]*?)(?![\w\d]+?\-\.(?:[\d\w\.\-]+?))(?=[\w\d])(?=[\w\d\.\-]*?\.+[\w\d\.\-]*?)(?![\w\d\.\-]{254})(?!(?:\.?[\w\d\-\.]*?[\w\d\-]{64,}\.)+?)[\w\d\.\-]+?(?<![\w\d\-\.]*?\.[\d]+?)(?<=[\w\d\-]{2,})(?<![\w\d\-]{25})(\s*,\s*(?!.*?_.*?)(?!(?:[\d\w]+?\.)?\-[\w\d\.\-]*?)(?![\w\d]+?\-\.(?:[\d\w\.\-]+?))(?=[\w\d])(?=[\w\d\.\-]*?\.+[\w\d\.\-]*?)(?![\w\d\.\-]{254})(?!(?:\.?[\w\d\-\.]*?[\w\d\-]{64,}\.)+?)[\w\d\.\-]+?(?<![\w\d\-\.]*?\.[\d]+?)(?<=[\w\d\-]{2,})(?<![\w\d\-]{25}))*\s*$/.test(
        value,
      ),
    ipv4: (value: string): boolean =>
      /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/g.test(
        value,
      ),
  };

  public static extendValidators(name: string, rule: (value1, value2?) => boolean): void {
    if (rule) {
      BindValidate.validators[name] = rule;
    }
  }

  public static extendValidateErrors(name: string, message: string): void {
    if (message) {
      BindValidate.validateErrors[name] = message;
    }
  }

  public static getOverrideRule(field: string, rulesOverride: RulesOverride = {}): string {
    if (undefined !== rulesOverride[field]) {
      return isEmpty(rulesOverride[field]) ? 'success' : rulesOverride[field];
    }

    return field;
  }

  private splitValidator(validator: string): {rule: string; relation?: string; condition?: string} {
    let split: string[] = validator.split(':');

    if (split.length > 1) {
      const [rule, relation]: string[] = split;
      return {rule, relation};
    }

    split = validator.split('=');

    if (split.length > 1) {
      const [rule, condition]: string[] = split;
      return {rule, condition};
    }

    return {rule: validator};
  }

  public validate(rulesOverride: RulesOverride = {}): boolean {
    const result: Partial<RulesOverride> = {};

    Object.keys(this.attributes).forEach((name: string) => {
      const value: any = this.attributes[name];
      let message: string;
      let isValidate: boolean;
      let validateRules: string = this.validateRules[name];

      if (validateRules) {
        if (Array.isArray(validateRules)) {
          isValidate = -1 !== validateRules.indexOf('required') || !isEmpty(value);
          validateRules = validateRules.join(',');
        } else if ('string' === typeof validateRules) {
          if ('required' === validateRules) {
            isValidate = true;
          } else {
            const rules: string[] = validateRules.split(',');
            isValidate = rules.length > 1 ? -1 !== validateRules.indexOf('required') || !isEmpty(value) : !isEmpty(value);
          }
        }
      }

      if (validateRules) {
        validateRules.split(',').forEach((validator: string) => {
          if (undefined !== result[name]) {
            return;
          }

          const orBindValidate: string[] = validator.split('|');
          const orResult: string[] = [];

          orBindValidate.forEach((validator: string) => {
            // eslint-disable-next-line prefer-const
            let {rule, relation, condition}: {rule: string; relation?: string; condition?: string} = this.splitValidator(validator);
            rule = rule.replace('-', '_');
            rule = BindValidate.getOverrideRule(rule, rulesOverride);

            let validated: boolean;

            if (isValidate) {
              if (!BindValidate.validators[rule]) {
                validated = true;
              } else if (condition) {
                validated = BindValidate.validators[rule](value, condition, this);
                message = validated ? undefined : interpolate(BindValidate.validateErrors[rule], {condition});
              } else if (relation) {
                validated = BindValidate.validators[rule](value, this.attributes[relation], this);
              } else {
                validated = BindValidate.validators[rule](value, undefined, this);
              }
            } else {
              validated = true;
            }

            if (!validated) {
              orResult.push(rule);
            }
          });

          const validCount: number = orBindValidate.length;
          const resultCount: number = orResult.length;

          if (undefined === result[name] && validCount === resultCount) {
            result[name] = message || BindValidate.validateErrors[orResult[0]];
          }
        });
      }
    });

    this.forEach((field: string) => {
      this.setError(field, result[field] || '');
    });

    if (this.hasError()) {
      this.invalid();
    }

    return Object.keys(result).length === 0;
  }
}
