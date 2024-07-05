import _ from 'lodash';
import DateTime from 'shared/lib/date-time';
import {ModelType} from 'entities/index';
import {isEmpty, normalizeUrl, toInt, toNumber, isClass} from 'shared/lib/helpers';

export default abstract class AbstractModel {
  protected abstract $modelType: ModelType;
  protected abstract $castRules: CastReturnType;

  protected attributes: SomeObjectType = {};
  protected originalAttributes: SomeObjectType = {};

  private extended: boolean = false;

  public get modelType(): ModelType {
    return this.$modelType;
  }

  protected get castRules(): CastReturnType {
    return this.$castRules ?? {};
  }

  constructor(params: {} | [], extended: boolean = false) {
    this.extend(params, extended);
  }

  public extend(attributesOrModel: any, extended: boolean = true): this {
    let attributes: any;

    if (this.extended !== extended) {
      this.extended = extended;
    }

    attributes = attributesOrModel instanceof AbstractModel ? attributesOrModel.toOriginalObject() : attributesOrModel;

    if (Array.isArray(attributes)) {
      attributes = {items: attributes};
    }

    if (extended) {
      attributes = Object.assign({}, this.originalAttributes, attributes);
    }

    this.originalAttributes = _.clone(attributes);
    this.parse(attributes);

    return this;
  }

  public toOriginalObject(): SomeObjectType {
    return this.originalAttributes;
  }

  protected beforeParse(attributes: SomeObjectType): SomeObjectType {
    return attributes;
  }

  protected afterParse(attributes: SomeObjectType): void {}

  protected parse(attributes: SomeObjectType): void {
    attributes = this.beforeParse(attributes);

    if (isEmpty(this.$castRules)) {
      this.$castRules = this.castRules;
    }

    const fields: string[] = Object.keys(attributes);

    fields.forEach((field: string) => this.setAttribute(field, attributes[field]));

    Object.keys(this.castRules).forEach((field: string) => {
      if (!fields.includes(field)) {
        this.setAttribute(field, undefined);
      }
    });

    this.afterParse(attributes);
  }

  private castValue(field: string, value: any): any {
    if (isEmpty(this.$castRules)) {
      this.$castRules = this.castRules;
    }

    if (undefined !== this.castRules[field]) {
      if ('object' === typeof this.castRules[field]) {
        const {type, defaultValue, path}: CastObjectType = this.castRules[field] as CastObjectType;

        if ('function' === typeof type && undefined !== path) {
          return this.castClass(_.toString(path).split('.'), type, value);
        }

        if (isEmpty(value)) {
          return defaultValue;
        }

        return this.valueToType(value, type);
      } else {
        return this.valueToType(value, this.castRules[field] as CastType);
      }
    }

    return value;
  }

  private castClass(path: string[], type: Function, value: SomeObjectType | []): SomeObjectType | [] | undefined {
    if (0 === path.length) {
      return 'function' === typeof type ? this.valueToType(value, type) : value;
    }

    const pathSegment = path.shift();

    switch (pathSegment) {
      case '[]':
        return Array.isArray(value) ? value.map((item: any) => this.castClass(path.slice(), type, item)) : [];
      case '{}':
        const result: SomeObjectType = {};

        if (value instanceof Object && !(value instanceof Array)) {
          Object.keys(value).forEach(
            (field: string) => (result[field] = this.castClass(path.slice(), type, value[field]))
          );
        }

        return result;
      default:
        return;
    }
  }

  public hasAttribute(field: string): boolean {
    return this.hasOwnProperty(_.camelCase(field));
  }

  public attributeIsEmpty(field: string): boolean {
    return this.hasAttribute(field) ? isEmpty(this.getAttribute(field)) : false;
  }

  public getAttribute(field: string): any {
    const property: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(this, _.camelCase(field));
    // @ts-expect-error
    return property?.get();
  }

  public setAttribute(field: string, value: any): void {
    this.attributes[field] = this.castValue(field, value);

    if (this.hasOwnProperty(field) && Object.getOwnPropertyDescriptor(this, field)?.get) {
      return;
    }

    let get = (): any => this.attributes[field];
    const set = (newValue: any): void => {
      if (undefined !== newValue) {
        throw Error(`Error set "${field}" field. Please use .setAttribute(field, value)`);
      }
    };

    switch (this.castRules[field] as CastType) {
      case 'url':
        get = (): string => normalizeUrl(this.attributes[field]);
        break;

      case 'url[]':
        get = (): string[] => {
          if (this.attributes[field]) {
            if (Array.isArray(this.attributes[field])) {
              return this.attributes[field].map((url: string) => normalizeUrl(url));
            }

            if ('string' === typeof this.attributes[field]) {
              return [normalizeUrl(this.attributes[field])];
            }
          }

          return [];
        };
        break;

      case 'datetime':
        Object.defineProperty(this, `${field}Formatted`, {
          get: () =>
            isEmpty(this.attributes[field]) ? undefined : (this.attributes[field] as DateTime).getFormatted(),
          set,
        });
        break;

      case 'amount':
        Object.defineProperty(this, `${field}Formatted`, {
          get: () => {
            const lang: string = window.navigator.language || 'en';
            const currency: string = !this.attributeIsEmpty('currency') ? this.getAttribute('currency') : 'USD';

            return new Intl.NumberFormat(lang, {style: 'currency', currency}).format(this.attributes[field]);
          },
          set,
        });
        break;

      case 'string':
        Object.defineProperty(this, `${field}Formatted`, {
          get: () => this.attributes[field] || undefined,
          set,
        });
        break;

      case 'string[]':
        Object.defineProperty(this, `${field}Formatted`, {
          get: () => (isEmpty(this.attributes[field]) ? undefined : this.attributes[field].join(', ')),
          set,
        });
        break;
    }

    Object.defineProperty(this, field, {
      get,
      set,
    });
  }

  private valueToType(value: any, type: CastType): any {
    switch (type) {
      case 'integer':
        return toInt(value, 0);

      case 'integer[]':
        return Array.isArray(value)
          ? value.map((chunk: any) => toInt(chunk, 0))
          : String(value)
              .split(',')
              .filter((n: string) => !isEmpty(n.trim()))
              .map((chunk: string) => toInt(chunk.trim(), 0));

      case 'float':
        return toNumber(value);

      case 'float[]':
        return Array.isArray(value)
          ? value.map((chunk: any) => toNumber(chunk))
          : String(value)
              .split(',')
              .filter((n: string) => !isEmpty(n.trim()))
              .map((chunk: string) => toNumber(chunk.trim()));

      case 'amount':
        return undefined === value || null === value ? undefined : toNumber(value);

      case 'boolean':
        if (isEmpty(value)) {
          return false;
        }

        if (['false', '0'].includes(_.toString(value).toLowerCase())) {
          return false;
        }

        return Boolean(value);

      case 'string':
        return _.toString(value);

      case 'string[]':
        if ('string' === typeof value) {
          return value
            .split(',')
            .filter((n: string) => !isEmpty(n.trim()))
            .map((chunk: string) => chunk.trim());
        }

        if (Array.isArray(value)) {
          return value.map((chunk: any) => _.toString(chunk));
        }

        return [];

      case 'regexp':
        if (!value) {
          return;
        }

        if (value instanceof RegExp) {
          return value;
        }

        const found: [any, RegExp | string, string] | null = value.match(/\/(.*)\/([gsmixu]{0,})/ms);

        if (found) {
          const [, regexp, flags]: [any, RegExp | string, string] = found;
          return new RegExp(regexp, flags);
        }

        return;

      case 'array':
        return isEmpty(value) ? [] : value;

      case 'object':
        return isEmpty(value) ? {} : value;

      case 'datetime':
        if (value instanceof DateTime) {
          return value;
        }

        if (null === value) {
          return undefined;
        }

        return new DateTime(value);

      case 'function':
        if (value instanceof type) {
          return value;
        }

        if (isClass(type)) {
          if (isEmpty(value)) {
            return undefined;
          }

          // @ts-expect-error
          return new type(value);
        } else {
          // @ts-expect-error
          return type(value);
        }

      default:
        return value;
    }
  }
}
