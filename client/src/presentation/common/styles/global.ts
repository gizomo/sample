import {addAlphaToRgb, hexToRgb} from '../../../utils/helpers';

interface Operator {
  theme: {
    selectColor: string;
    shadeColor: string;
  };
}

export class GlobalStyles {
  public static readonly defaultSelectHex: string = '#ff6600';
  public static readonly defaultShadeHex: string = '#d95b15';

  public static selectRgb: string = hexToRgb(GlobalStyles.defaultSelectHex);
  public static shadeRgb: string = hexToRgb(GlobalStyles.defaultShadeHex);

  public static update(operator: Operator): Promise<Operator> {
    if (!operator) {
      return Promise.resolve(operator);
    }

    const select: string = hexToRgb(operator.theme.selectColor || GlobalStyles.defaultSelectHex);
    const shade: string = hexToRgb(operator.theme.shadeColor || GlobalStyles.defaultShadeHex);

    if (GlobalStyles.selectRgb === select && GlobalStyles.shadeRgb === shade) {
      return Promise.resolve(operator);
    }

    return new Promise((resolve: (value?: any) => void) => {
      for (const sheet of window.document.styleSheets) {
        for (let i: number = 0; i < sheet.cssRules.length; i++) {
          const rule: CSSRule = sheet.cssRules[i];
          const cssRule: string = GlobalStyles.replace(
            GlobalStyles.replace(rule.cssText, GlobalStyles.selectRgb, select),
            GlobalStyles.shadeRgb,
            shade,
          );

          if (rule.cssText !== cssRule) {
            sheet.deleteRule(i);
            sheet.insertRule(cssRule, i);
          }
        }
      }

      GlobalStyles.selectRgb = select;
      GlobalStyles.shadeRgb = shade;

      resolve(operator);
    });
  }

  public static replace(str: string, subStr: string, newSubStr: string): string {
    return str.split(subStr).join(newSubStr);
  }

  public static getSelectColor(alpha: number): string {
    return addAlphaToRgb(GlobalStyles.selectRgb, alpha);
  }

  public static getShadeColor(alpha: number): string {
    return addAlphaToRgb(GlobalStyles.shadeRgb, alpha);
  }
}
