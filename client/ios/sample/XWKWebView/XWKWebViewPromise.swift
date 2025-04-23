//
//  XWKWebViewPromise.swift
//  sample
//
//  Created by Ivan Godenov on 15.11.2024.
//

import Foundation
import WebKit

public class XWKWebViewPromise: NSObject {
    private var webView: WKWebView
    private var promiseId: String
    private var payload: String?
    
    init(webView: WKWebView, promiseId: String) {
        self.webView = webView
        self.promiseId = promiseId
    }
    
    public func resolve(_ payload: String?) {
        let js =
        """
        window.ios.resolvePromise('\(promiseId)', '\(payload ?? "undefined")');
        """
        webView.evaluateJavaScript(js, completionHandler: { (result, error) in
            if (nil == error) {
                XWKWebViewUtil.log("promise resolved")
            } else {
                XWKWebViewUtil.log(error)
            }
        })
    }
    
    public func resolve() {
        resolve(nil)
    }
    
    public func reject(_ payload: String?) {
        let js =
        """
        window.ios.rejectPromise('\(promiseId)', '\(payload ?? "undefined")');
        """
        webView.evaluateJavaScript(js, completionHandler: { (result, error) in
            if (nil == error) {
                XWKWebViewUtil.log("promise rejected")
            } else {
                XWKWebViewUtil.log(error)
            }
        })
    }
    
    public func reject() {
        reject(nil)
    }
}
