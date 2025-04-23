package com.sample;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.webkit.WebResourceErrorCompat;
import androidx.webkit.WebViewClientCompat;
import androidx.webkit.WebViewFeature;

import com.sample.player.MediaClient;
import com.sample.system.RemoteKeyEvent;

import de.andycandy.android.bridge.Bridge;
import de.andycandy.android.bridge.JSInterface;
import io.sentry.Sentry;

public class WebViewController implements MediaClient {
    private final WebView webView;
    private final Bridge bridge;
    private final String portalUrl;

    private Runnable onPageLoaded = null;
    private Runnable onLoadFailed = null;
    private Runnable onSslError = null;

    public WebViewController(final Activity activity) {
        WebView.setWebContentsDebuggingEnabled(true);

        webView = activity.findViewById(R.id.web_view);
        bridge = new Bridge(activity, webView, "android");
        portalUrl = getStartUrl(activity);

        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                onPageLoaded = null;
                onLoadFailed = null;
                onSslError.run();

                String message = "SSL Error";

                switch (error.getPrimaryError()) {
                    case SslError.SSL_UNTRUSTED:
                        message = "The certificate authority is not trusted";
                        break;
                    case SslError.SSL_EXPIRED:
                        message = "The certificate has expired";
                        break;
                    case SslError.SSL_IDMISMATCH:
                        message = "The certificate Hostname mismatch";
                        break;
                    case SslError.SSL_NOTYETVALID:
                        message = "The certificate is not yet valid";
                        break;
                }

                Log.e("WebView.SSL.Error", message);

                Sentry.captureMessage(message);

                super.onReceivedSslError(view, handler, error);
            }

            @Override
            public void onReceivedError(@NonNull WebView view, @NonNull WebResourceRequest request, @NonNull WebResourceErrorCompat error) {
                if (null != onLoadFailed) {
                    webView.stopLoading();
                    webView.loadUrl("about:blank");
                    webView.clearHistory();
                    onPageLoaded = null;
                    onLoadFailed.run();

                    String code = WebViewFeature.isFeatureSupported(WebViewFeature.WEB_RESOURCE_ERROR_GET_CODE) ? String.valueOf(error.getErrorCode()) : "UNKNOWN";
                    String description = WebViewFeature.isFeatureSupported(WebViewFeature.WEB_RESOURCE_ERROR_GET_DESCRIPTION) ? String.valueOf(error.getDescription()) : error.toString();
                    String message = description + ", " + code;

                    Log.e("WebView.Error", message);

                    Sentry.captureMessage(message);
                } else {
                    super.onReceivedError(view, request, error);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                webView.requestFocus();

                if (null != onPageLoaded) {
                    onLoadFailed = null;
                    onPageLoaded.run();

                    Log.i("WebView.PageLoaded", url);

                    Sentry.captureMessage(url);
                }
            }
        });

        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setJavaScriptEnabled(true);

        webView.clearCache(true);
        webView.clearFormData();
        webView.clearHistory();

        webView.evaluateJavascript("!function(e,t){\"object\"==typeof exports&&\"undefined\"!=typeof module?t():\"function\"==typeof define&&define.amd?define(t):t()}(0,function(){\"use strict\";function e(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})}function t(e){return new this(function(t,n){function r(e,n){if(n&&(\"object\"==typeof n||\"function\"==typeof n)){var f=n.then;if(\"function\"==typeof f)return void f.call(n,function(t){r(e,t)},function(n){o[e]={status:\"rejected\",reason:n},0==--i&&t(o)})}o[e]={status:\"fulfilled\",value:n},0==--i&&t(o)}if(!e||\"undefined\"==typeof e.length)return n(new TypeError(typeof e+\" \"+e+\" is not iterable(cannot read property Symbol(Symbol.iterator))\"));var o=Array.prototype.slice.call(e);if(0===o.length)return t([]);for(var i=o.length,f=0;o.length>f;f++)r(f,o[f])})}function n(e,t){this.name=\"AggregateError\",this.errors=e,this.message=t||\"\"}function r(e){var t=this;return new t(function(r,o){if(!e||\"undefined\"==typeof e.length)return o(new TypeError(\"Promise.any accepts an array\"));var i=Array.prototype.slice.call(e);if(0===i.length)return o();for(var f=[],u=0;i.length>u;u++)try{t.resolve(i[u]).then(r)[\"catch\"](function(e){f.push(e),f.length===i.length&&o(new n(f,\"All promises were rejected\"))})}catch(c){o(c)}})}function o(e){return!(!e||\"undefined\"==typeof e.length)}function i(){}function f(e){if(!(this instanceof f))throw new TypeError(\"Promises must be constructed via new\");if(\"function\"!=typeof e)throw new TypeError(\"not a function\");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],s(e,this)}function u(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,f._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value)}catch(o){return void a(t.promise,o)}c(t.promise,r)}else(1===e._state?c:a)(t.promise,e._value)})):e._deferreds.push(t)}function c(e,t){try{if(t===e)throw new TypeError(\"A promise cannot be resolved with itself.\");if(t&&(\"object\"==typeof t||\"function\"==typeof t)){var n=t.then;if(t instanceof f)return e._state=3,e._value=t,void l(e);if(\"function\"==typeof n)return void s(function(e,t){return function(){e.apply(t,arguments)}}(n,t),e)}e._state=1,e._value=t,l(e)}catch(r){a(e,r)}}function a(e,t){e._state=2,e._value=t,l(e)}function l(e){2===e._state&&0===e._deferreds.length&&f._immediateFn(function(){e._handled||f._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;n>t;t++)u(e,e._deferreds[t]);e._deferreds=null}function s(e,t){var n=!1;try{e(function(e){n||(n=!0,c(t,e))},function(e){n||(n=!0,a(t,e))})}catch(r){if(n)return;n=!0,a(t,r)}}n.prototype=Error.prototype;var d=setTimeout;f.prototype[\"catch\"]=function(e){return this.then(null,e)},f.prototype.then=function(e,t){var n=new this.constructor(i);return u(this,new function(e,t,n){this.onFulfilled=\"function\"==typeof e?e:null,this.onRejected=\"function\"==typeof t?t:null,this.promise=n}(e,t,n)),n},f.prototype[\"finally\"]=e,f.all=function(e){return new f(function(t,n){function r(e,o){try{if(o&&(\"object\"==typeof o||\"function\"==typeof o)){var u=o.then;if(\"function\"==typeof u)return void u.call(o,function(t){r(e,t)},n)}i[e]=o,0==--f&&t(i)}catch(c){n(c)}}if(!o(e))return n(new TypeError(\"Promise.all accepts an array\"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var f=i.length,u=0;i.length>u;u++)r(u,i[u])})},f.any=r,f.allSettled=t,f.resolve=function(e){return e&&\"object\"==typeof e&&e.constructor===f?e:new f(function(t){t(e)})},f.reject=function(e){return new f(function(t,n){n(e)})},f.race=function(e){return new f(function(t,n){if(!o(e))return n(new TypeError(\"Promise.race accepts an array\"));for(var r=0,i=e.length;i>r;r++)f.resolve(e[r]).then(t,n)})},f._immediateFn=\"function\"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){d(e,0)},f._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn(\"Possible Unhandled Promise Rejection:\",e)};var p=function(){if(\"undefined\"!=typeof self)return self;if(\"undefined\"!=typeof window)return window;if(\"undefined\"!=typeof global)return global;throw Error(\"unable to locate global object\")}();\"function\"!=typeof p.Promise?p.Promise=f:(p.Promise.prototype[\"finally\"]||(p.Promise.prototype[\"finally\"]=e),p.Promise.allSettled||(p.Promise.allSettled=t),p.Promise.any||(p.Promise.any=r))});", null);
    }

    public void start(Runnable resolve, Runnable reject, Runnable sslHandler) {
        onPageLoaded = resolve;
        onLoadFailed = reject;
        onSslError = sslHandler;

        Log.i("WebView.loadUrl", portalUrl);

        webView.loadUrl(portalUrl);
    }

    public void restoreState(@NonNull Bundle bundle) {
        webView.restoreState(bundle);
    }

    public void addJSInterface(JSInterface jsInterface) {
        bridge.addJSInterface(jsInterface);
    }

    public void dispatchHomeKeyEvent() {
        webView.dispatchKeyEvent(RemoteKeyEvent.createFakeHomeEvent());
    }

    public void dispatchEscKeyEvent() {
        webView.dispatchKeyEvent(RemoteKeyEvent.createFakeEscEvent());
    }

    public void onMediaButtonEvent(KeyEvent event) {
        webView.dispatchKeyEvent(event);
    }

    private String getStartUrl(final Activity activity) {
        Intent intent = activity.getIntent();
        String appLinkAction = intent.getAction();
        Uri appLinkData = intent.getData();

        if (Intent.ACTION_VIEW.equals(appLinkAction) && null != appLinkData) {
            return appLinkData.toString();
        } else {
            return activity.getString(R.string.portalUrl);
        }
    }
}
