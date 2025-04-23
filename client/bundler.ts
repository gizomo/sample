import path from 'path';
import process from 'node:process';
import fs from 'fs';

type AppConfig = {
  name: string;
  displayName: string;
  configUrl: string;
  portalUrl: string;
  enableExtendedLanguages: boolean;
  sentryDsn: string;
};

type PackageConfig = {
  version: string;
};

export default class Bundler {
  private readonly platform: string;
  private readonly outDir: string;
  private readonly loaderFile: string;
  private readonly scripts: string[] = [];

  constructor(outDir: string, platform: 'mobile' | 'tv' | 'web') {
    console.log(`Building platform: ${platform}, version: ${process.env.TB_VERSION_SEMVER}`);
    this.platform = platform;
    this.outDir = path.join(__dirname, outDir);
    this.loaderFile = path.join(__dirname, 'loader.js');
  }

  public getOutDir(): string {
    return this.outDir;
  }

  public getAppConfig(): AppConfig {
    const configPath: string = path.join(this.outDir, 'app.json');

    if (!fs.existsSync(configPath)) {
      return {
        name: '',
        displayName: '',
        configUrl: '',
        portalUrl: '',
        enableExtendedLanguages: false,
        sentryDsn: '',
      };
    }

    return JSON.parse(fs.readFileSync(configPath).toString());
  }

  public getPackageConfig(): PackageConfig {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString());
  }

  public parseScripts(html: string): this {
    const result: RegExpMatchArray | null = html.match(/ src="(.*?)"/g);

    if (result) {
      result.forEach((item: string): void => {
        const res = item.match(/ src="(.*?)"/);
        const script: string = res ? res[1] : '';

        if (script) {
          this.scripts.push(path.join(this.outDir, script));
        }
      });
    }

    return this;
  }

  public bundlePlayer(): this {
    const fontsPath: string = path.join(__dirname, './assets/fonts/fonts.css');
    const fontsOutPath: string = `${this.outDir}/assets/fonts.css`;

    if (fs.existsSync(fontsPath) && !fs.existsSync(fontsOutPath)) {
      fs.copyFileSync(fontsPath, fontsOutPath);
    }

    if (fs.existsSync(this.loaderFile)) {
      const outLoader: string = `${this.outDir}/assets/${path.basename(this.loaderFile)}`;

      if (fs.existsSync(outLoader)) {
        fs.unlinkSync(outLoader);
      }

      fs.copyFileSync(this.loaderFile, outLoader);
    }

    const packageConfig: PackageConfig = this.getPackageConfig();
    const version: string = `/** <playerVersion>${process.env.TB_VERSION_SEMVER || packageConfig.version}</playerVersion> */`;

    for (const script of this.scripts.reverse()) {
      if (fs.existsSync(script)) {
        const basename: string = path.basename(script);
        const data: string = fs.readFileSync(script)?.toString();

        let out: string = `${this.outDir}/assets/`;

        if (-1 !== basename.indexOf('polyfills-legacy')) {
          out = out + 'polyfills.js';
        } else if (-1 !== basename.indexOf('index-legacy')) {
          out = out + `${this.platform}.js`;
        } else {
          out = out + basename;
        }

        if (fs.existsSync(out)) {
          fs.unlinkSync(out);
        }

        fs.writeFileSync(out, [version, `window.portalVersion = "${process.env.TB_VERSION_SEMVER || packageConfig.version}";`, data].join('\n\n'));
      }
    }

    return this;
  }

  public clearScripts(): this {
    for (const script of this.scripts) {
      if (fs.existsSync(script)) {
        fs.unlinkSync(script);
      }
    }

    return this;
  }

  public toHtml(headers: string[] = [], singlePlatform: boolean = false): string {
    const appConfig: AppConfig = this.getAppConfig();

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover, user-scalable=no, minimal-ui" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="/manifest.json">
    <link rel="shortcut icon" href="/favicon.ico">
    <title>&nbsp;</title>
    <script>
      window.portalUrl = '${appConfig.portalUrl || ''}';
      window.sentryDsn = '${appConfig.sentryDsn || ''}';

      if (localStorage && localStorage.getItem) {
        try {
          var title = JSON.parse(localStorage.getItem('defaultOperatorName'));

          if (title) {
            window.document.title = title;
          }
        } catch (err) {}
      }

      (function () {
        function getPrefix(isLocal) {
          var p = Boolean(isLocal) ? '.' : (window.portalUrl || '.');

          if (p.slice(p.length, -1) !== '/') {
            p = p + '/';
          }

          return p + 'assets/';
        }
        
        window.loadStyle = function (a, c, isLocal) {
          var s = document.createElement('link');
          s.setAttribute('rel', 'stylesheet');
          s.setAttribute('as', 'style');
          s.setAttribute('href', getPrefix(isLocal) + a);
          document.getElementsByTagName('head')[0].append(s);
        }

        window.loadAsset = function (a, c, isLocal) {
          var s = document.createElement('script'); s.src = getPrefix(isLocal) + a;
          var b = document.getElementsByTagName('body')[0], done = false;

          s.onload = s.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
              done = true;
              if (c) { c(); }
              s.onload = s.onreadystatechange = null;
              b.removeChild(s);
            }
          };

          if (!isLocal) {
            s.onerror = function () { b.removeChild(s); window.loadAsset(a, c, true); };
          }

          b.appendChild(s);
        };

        window.importAsset = function (a, c, isLocal) {
          window.System.import(getPrefix(isLocal) + a)
            .then(
              function () { if (c) c(); },
              function (error) { isLocal ? console.log(error) : window.importAsset(a, c, true); }
            );
        };
      })();
    </script>

    <script>if (window.android) window.android.init();</script>

    ${headers.join('\n')}
  </head>
  <body>
    <script>window.loadStyle('fonts.css')</script>
    <script>window.loadAsset('polyfills.js', function () { ${
      singlePlatform ? `window.importAsset("${this.platform}.js");` : 'window.loadAsset("loader.js");'
    } });</script>
    <div id="app"></div>
  </body>
</html>`;
  }
}
