import examples from 'libphonenumber-js/examples.mobile.json';
import type {CountryCode} from 'libphonenumber-js';
import {AsYouType, getExampleNumber, isSupportedCountry, isValidNumber} from 'libphonenumber-js';

type AsYouTypeExtended = AsYouType & {
  formatter: {
    chosenFormat: any;
    template: string;
  };
};

export type PhoneInfo = {
  formattedNumber: string;
  placeholder?: string;
  country?: CountryCode;
};

export class PhoneFormatter {
  public static getEmojiFromCountry(country: CountryCode): string {
    if (!isSupportedCountry(country)) {
      return '';
    }

    const codePoints: number[] = country
      .toUpperCase()
      .split('')
      .map((char: string) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  public static getCountryByLocale(locale: string): CountryCode {
    return LocaleToCountryMap[locale] || 'US';
  }

  public static generatePlaceholder(country: CountryCode): string {
    if (!isSupportedCountry(country)) {
      return '';
    }

    const placeholderController: AsYouType = new AsYouType(country);

    const exampleNumber: string = getExampleNumber(country, examples).formatInternational();

    placeholderController.input(exampleNumber);

    return placeholderController.getTemplate();
  }

  public static getInfoAboutNumber(rawNumbersString: string): PhoneInfo {
    const numberController: AsYouTypeExtended = new AsYouType() as AsYouTypeExtended;
    const formattedNumber: string = numberController.input('+' + rawNumbersString);

    const country: CountryCode =
      numberController.country ||
      CountryCodeToCountryMap[numberController.getCallingCode()] ||
      CountryCodeToCountryMap[+rawNumbersString] ||
      undefined;

    let placeholder: string = undefined;

    if (country) {
      if (numberController.formatter.chosenFormat) {
        placeholder = numberController.formatter.template;
      } else {
        placeholder = 'XX';
      }
    }

    return {
      formattedNumber,
      placeholder,
      country,
    };
  }

  public static getNumbersFromInput(rawInput: string): string {
    return rawInput.replace(/[^0-9]/g, '');
  }

  public static hasExtraSymbols(rawInput: string): boolean {
    return /[^0-9+\s]/g.test(rawInput);
  }

  public static generateStartNumberForCountry(country: CountryCode): string {
    return `+${getExampleNumber(country, examples).countryCallingCode}`;
  }

  public static validatePhoneNumber(number: string): boolean {
    return isValidNumber(number);
  }

  public static getInitialPhoneData(rawNumbersString: string, locale: string): PhoneInfo {
    const isValid: boolean = PhoneFormatter.validatePhoneNumber(rawNumbersString);

    if (rawNumbersString) {
      if (isValid || !PhoneFormatter.hasExtraSymbols(rawNumbersString)) {
        const phoneInfo: PhoneInfo = PhoneFormatter.getInfoAboutNumber(PhoneFormatter.getNumbersFromInput(rawNumbersString));

        return {
          country: phoneInfo.country,
          placeholder: phoneInfo.placeholder || '',
          formattedNumber: phoneInfo.formattedNumber,
        };
      } else {
        return {
          formattedNumber: rawNumbersString,
          country: undefined,
          placeholder: '',
        };
      }
    } else {
      const country: CountryCode = PhoneFormatter.getCountryByLocale(locale);

      return {
        country: country,
        formattedNumber: PhoneFormatter.generateStartNumberForCountry(country),
        placeholder: PhoneFormatter.generatePlaceholder(country),
      };
    }
  }
}

export const CountryCodeToCountryMap: Record<number, string> = {
  1: 'US',
  7: 'RU',
  20: 'EG',
  27: 'ZA',
  30: 'GR',
  31: 'NL',
  32: 'BE',
  33: 'FR',
  34: 'ES',
  36: 'HU',
  39: 'IT',
  40: 'RO',
  41: 'CH',
  43: 'AT',
  44: 'GB',
  45: 'DK',
  46: 'SE',
  47: 'NO',
  48: 'PL',
  49: 'DE',
  51: 'PE',
  52: 'MX',
  53: 'CU',
  54: 'AR',
  55: 'BR',
  56: 'CL',
  57: 'CO',
  58: 'VE',
  60: 'MY',
  61: 'AU',
  62: 'ID',
  63: 'PH',
  64: 'NZ',
  65: 'SG',
  66: 'TH',
  81: 'JP',
  82: 'KR',
  84: 'VN',
  86: 'CN',
  90: 'TR',
  91: 'IN',
  92: 'PK',
  93: 'AF',
  94: 'LK',
  95: 'MM',
  98: 'IR',
  211: 'SS',
  212: 'MA',
  213: 'DZ',
  216: 'TN',
  218: 'LY',
  220: 'GM',
  221: 'SN',
  222: 'MR',
  223: 'ML',
  224: 'GN',
  225: 'CI',
  226: 'BF',
  227: 'NE',
  228: 'TG',
  229: 'BJ',
  230: 'MU',
  231: 'LR',
  232: 'SL',
  233: 'GH',
  234: 'NG',
  235: 'TD',
  236: 'CF',
  237: 'CM',
  238: 'CV',
  239: 'ST',
  240: 'GQ',
  241: 'GA',
  242: 'CG',
  243: 'CD',
  244: 'AO',
  245: 'GW',
  246: 'IO',
  247: 'AC',
  248: 'SC',
  249: 'SD',
  250: 'RW',
  251: 'ET',
  252: 'SO',
  253: 'DJ',
  254: 'KE',
  255: 'TZ',
  256: 'UG',
  257: 'BI',
  258: 'MZ',
  260: 'ZM',
  261: 'MG',
  262: 'RE',
  263: 'ZW',
  264: 'NA',
  265: 'MW',
  266: 'LS',
  267: 'BW',
  268: 'SZ',
  269: 'KM',
  290: 'SH',
  291: 'ER',
  297: 'AW',
  298: 'FO',
  299: 'GL',
  350: 'GI',
  351: 'PT',
  352: 'LU',
  353: 'IE',
  354: 'IS',
  355: 'AL',
  356: 'MT',
  357: 'CY',
  358: 'FI',
  359: 'BG',
  370: 'LT',
  371: 'LV',
  372: 'EE',
  373: 'MD',
  374: 'AM',
  375: 'BY',
  376: 'AD',
  377: 'MC',
  378: 'SM',
  380: 'UA',
  381: 'RS',
  382: 'ME',
  383: 'XK',
  385: 'HR',
  386: 'SI',
  387: 'BA',
  389: 'MK',
  420: 'CZ',
  421: 'SK',
  423: 'LI',
  500: 'FK',
  501: 'BZ',
  502: 'GT',
  503: 'SV',
  504: 'HN',
  505: 'NI',
  506: 'CR',
  507: 'PA',
  508: 'PM',
  509: 'HT',
  590: 'GP',
  591: 'BO',
  592: 'GY',
  593: 'EC',
  594: 'GF',
  595: 'PY',
  596: 'MQ',
  597: 'SR',
  598: 'UY',
  599: 'CW',
  670: 'TL',
  672: 'NF',
  673: 'BN',
  674: 'NR',
  675: 'PG',
  676: 'TO',
  677: 'SB',
  678: 'VU',
  679: 'FJ',
  680: 'PW',
  681: 'WF',
  682: 'CK',
  683: 'NU',
  685: 'WS',
  686: 'KI',
  687: 'NC',
  688: 'TV',
  689: 'PF',
  690: 'TK',
  691: 'FM',
  692: 'MH',
  850: 'KP',
  852: 'HK',
  853: 'MO',
  855: 'KH',
  856: 'LA',
  880: 'BD',
  886: 'TW',
  960: 'MV',
  961: 'LB',
  962: 'JO',
  963: 'SY',
  964: 'IQ',
  965: 'KW',
  966: 'SA',
  967: 'YE',
  968: 'OM',
  970: 'PS',
  971: 'AE',
  972: 'IL',
  973: 'BH',
  974: 'QA',
  975: 'BT',
  976: 'MN',
  977: 'NP',
  992: 'TJ',
  993: 'TM',
  994: 'AZ',
  995: 'GE',
  996: 'KG',
  998: 'UZ',
};

export const LocaleToCountryMap: Record<string, CountryCode> = {
  af: 'ZA',
  am: 'ET',
  ar: 'EG',
  ay: 'BO',
  az: 'AZ',
  be: 'BY',
  bg: 'BG',
  bi: 'VU',
  bn: 'BD',
  bs: 'BA',
  ca: 'AD',
  ch: 'GU',
  da: 'DK',
  de: 'DE',
  dv: 'MV',
  dz: 'BT',
  el: 'GR',
  en: 'US',
  es: 'MX',
  et: 'EE',
  eu: 'ES',
  fa: 'IR',
  ff: 'BF',
  fi: 'FI',
  fo: 'FO',
  fr: 'FR',
  ga: 'IE',
  gl: 'ES',
  gn: 'AR',
  he: 'IL',
  hi: 'IN',
  hr: 'HR',
  ht: 'HT',
  hu: 'HU',
  hy: 'AM',
  id: 'ID',
  is: 'IS',
  it: 'IT',
  ja: 'JP',
  ka: 'GE',
  kk: 'KZ',
  kl: 'GL',
  km: 'KH',
  ko: 'KR',
  ku: 'IQ',
  ky: 'KG',
  lb: 'LU',
  ln: 'CG',
  lt: 'LT',
  lv: 'LV',
  mg: 'MG',
  mh: 'MH',
  mi: 'NZ',
  mk: 'MK',
  mn: 'MN',
  ms: 'MY',
  mt: 'MT',
  my: 'MM',
  na: 'NR',
  nb: 'NO',
  nd: 'ZW',
  ne: 'NP',
  nl: 'NL',
  nn: 'NO',
  no: 'NO',
  nr: 'ZA',
  ny: 'MW',
  oc: 'ES',
  pa: 'AW',
  pl: 'PL',
  ps: 'AF',
  pt: 'BR',
  qu: 'BO',
  rn: 'BI',
  ro: 'RO',
  ru: 'RU',
  rw: 'RW',
  sg: 'CF',
  si: 'LK',
  sk: 'SK',
  sl: 'SI',
  sm: 'WS',
  sn: 'ZW',
  so: 'SO',
  sq: 'AL',
  sr: 'RS',
  ss: 'ZA',
  st: 'LS',
  sv: 'SE',
  sw: 'TZ',
  ta: 'LK',
  tg: 'TJ',
  th: 'TH',
  ti: 'ER',
  tk: 'TM',
  tn: 'BW',
  to: 'TO',
  tr: 'TR',
  uk: 'UA',
  ur: 'PK',
  uz: 'UZ',
  zh: 'CN',
};
