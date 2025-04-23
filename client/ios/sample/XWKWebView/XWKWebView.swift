//
//  XWKWebView.swift
//  sample
//
//  Created by Ivan Godenov on 15.11.2024.
//

import Foundation
import WebKit

public class XWKWebView: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    public static var enableLogging = true
    
    private let webkitNamespace = "XWKWebView"
    private let webkitNamespaceForInvokeJs = "XWKWebViewInvokeJs"
    
    private var webView: WKWebView
    private var pluginObjRef = Dictionary<String, AnyObject>()
    
    public typealias invokeJsCallback = (_ payload: AnyObject?) -> Void
    public var invokeJsCallbackSuccessArr = Dictionary<String, invokeJsCallback>()
    public var invokeJsCallbackFailureArr = Dictionary<String, invokeJsCallback>()
    
    
    public init(_ webView: WKWebView, _ plugins: Dictionary<String, AnyObject>? = nil) {
        self.webView = webView
        
        super.init()
        
        var controllers = ""
        
        if (nil != plugins && !plugins!.isEmpty) {
            for (namespace, obj) in plugins! {
                controllers = controllers + generateJSController(obj, namespace)
            }
        }
        
        let js =
        """
        window['ios'] = {
            promises: {},
            resolvePromise: function(promiseId, data) {
                if (data) {
                    try {
                        var json = JSON.parse(data);
                        window.ios.promises[promiseId].resolve(json);
                    } catch {
                        window.ios.promises[promiseId].resolve(data);
                    }
                }

                delete window.ios.promises[promiseId];
            },
            rejectPromise: function(promiseId, error) {
                if (error) {
                    try {
                        var json = JSON.parse(error);
                        window.ios.promises[promiseId].resolve(json);
                    } catch {
                        window.ios.promises[promiseId].reject(error);
                    }
                }

                delete window.ios.promises[promiseId];
            },
            generateUUID: function() {
                var d = new Date().getTime();
                var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
                uuid = uuid.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random()*16)%16 | 0;
                    d = Math.floor(d/16);
                    return ('x' === c ? r : (r&0x3|0x8)).toString(16);
                });

                return uuid;
            },
        };
        \(controllers)
        """
        let script = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        let userContentController = webView.configuration.userContentController
        userContentController.addUserScript(script)
        
        //inject js to native bridge
        userContentController.add(self, name: webkitNamespace)
        //expose js namespace to execute js call from native
        userContentController.add(self, name: webkitNamespaceForInvokeJs)
    }
    
    public func registerPlugin(_ obj: AnyObject, namespace: String) {
        pluginObjRef["{\(namespace)}"] = obj
        
        let js = "(function() {\(generateJSController(obj, namespace))})();"
        
        webView.evaluateJavaScript(js, completionHandler: { (result, error) in
            if (nil == error) {
                XWKWebViewUtil.log("plugin js namespace successfully registered: \(namespace)")
            } else {
                XWKWebViewUtil.log(error)
            }
        })
    }
    
    public func invokeJs(_ js: String, onSuccess: @escaping invokeJsCallback, onFailure: @escaping invokeJsCallback) {
        let promiseId = UUID().uuidString
        invokeJsCallbackSuccessArr[promiseId] = onSuccess
        invokeJsCallbackFailureArr[promiseId] = onFailure
        
        let js =
        """
        (function() {
            var dataToSend = {};
            dataToSend.promiseId = '\(promiseId)';
        
            if (typeof \(js) === 'undefined') {
                console.log('\(js) undefined');
                return;
            }
        
            \(js)
            .then(function(result) {
                dataToSend.payload = result;
                dataToSend.promiseType = 'resolve';
                var jsonString = (JSON.stringify(dataToSend));
                try {
                    webkit.messageHandlers.\(webkitNamespaceForInvokeJs).postMessage(jsonString);
                } catch(e) { console.log(e) }
            })
            .catch(function(error) {
                dataToSend.payload = error;
                dataToSend.promiseType = 'reject';
                var jsonString = (JSON.stringify(dataToSend));
                try {
                    webkit.messageHandlers.\(webkitNamespaceForInvokeJs).postMessage(jsonString);
                } catch(e) { console.log(e) }
            });
        })();
        """
        
        webView.evaluateJavaScript(js, completionHandler: { (result, error) in
            if (nil == error) {
                XWKWebViewUtil.log("js function invoked successfully: \(js)")
            } else {
                XWKWebViewUtil.log(error)
            }
        })
    }
    
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.name == webkitNamespace) {
            XWKWebViewUtil.log("postMessageHandler payload of \(webkitNamespace): \(message.body)")
            if let body = message.body as? String {
                do {
                    if let json = body.data(using: String.Encoding.utf8) {
                        if let jsonData = try JSONSerialization.jsonObject(with: json, options: .allowFragments) as? [String: AnyObject] {
                            let namespace = jsonData["namespace"] as! String
                            let method = jsonData["method"] as! String
                            let payload = jsonData["payload"]
                            let promiseId = jsonData["promiseId"] as? String ?? ""
                            
                            let selector = NSSelectorFromString("\(method)")
                            if let obj = pluginObjRef["{\(namespace)}"] {
                                if obj.responds(to: selector) {
                                    if (promiseId.isEmpty) {
                                        _ = obj.perform(NSSelectorFromString("\(method)"), with: payload)
                                    } else {
                                        let nativePromise = XWKWebViewPromise(webView: webView, promiseId: promiseId)
                                        _ = obj.perform(NSSelectorFromString("\(method)"), with: payload, with: nativePromise)
                                    }
                                } else {
                                    XWKWebViewUtil.log("No method found")
                                }
                            } else {
                                XWKWebViewUtil.log("No obj ref found")
                            }
                        }
                    }
                } catch {
                    XWKWebViewUtil.log(error)
                }
            } else {
                XWKWebViewUtil.log("failed to parse json")
            }
        } else if (message.name == webkitNamespaceForInvokeJs) {
            XWKWebViewUtil.log("postMessageHandler payload of \(webkitNamespaceForInvokeJs): \(message.body)")
            if let body = message.body as? String {
                do {
                    if let json = body.data(using: String.Encoding.utf8) {
                        if let jsonData = try JSONSerialization.jsonObject(with: json, options: .allowFragments) as? [String: AnyObject] {
                            let promiseId = jsonData["promiseId"] as! String
                            let promiseType = jsonData["promiseType"] as! String
                            let payload = jsonData["payload"]
                            
                            if let successCallback = invokeJsCallbackSuccessArr[promiseId],
                                let failureCallback = invokeJsCallbackFailureArr[promiseId] {
                                if promiseType == "resolve" {
                                    successCallback(payload)
                                } else if promiseType == "reject" {
                                    failureCallback(payload)
                                }
                                invokeJsCallbackSuccessArr.removeValue(forKey: promiseId)
                                invokeJsCallbackFailureArr.removeValue(forKey: promiseId)
                            } else {
                                XWKWebViewUtil.log("no success/failure callback specified")
                            }
                        }
                    }
                } catch {
                    XWKWebViewUtil.log(error)
                }
            } else {
                XWKWebViewUtil.log("failed to parse json")
            }
        } else {
            XWKWebViewUtil.log("postMessageHandler payload: unsupported webkit namespace")
        }
    }
}

extension XWKWebView {
    func iterateMethodForClass(_ cls: AnyClass) -> [String] {
        var methodCount: UInt32 = 0
        let methodList = class_copyMethodList(cls, &methodCount)
        var array: [String] = []
        
        if let methodList = methodList, methodCount > 0 {
            enumerateCArray(array: methodList, count: methodCount) { i, m in
                let name = methodName(m: m) ?? "unknown"
                array.append(name)
            }
            
            free(methodList)
        }
        
        return array
    }
    
    func enumerateCArray<T>(array: UnsafePointer<T>, count: UInt32, f: (UInt32, T) -> Void) {
        var ptr = array
        for i in 0..<count {
            f(i, ptr.pointee)
            ptr = ptr.successor()
        }
    }
    
    func methodName(m: Method) -> String? {
        let sel = method_getName(m)
        let nameCString = sel_getName(sel)
        return String(cString: nameCString)
    }
    
    func generateJSController(_ obj: AnyObject, _ namespace: String) -> String {
        pluginObjRef["{\(namespace)}"] = obj
        
        var methods = ""
        
        if let cls = NSClassFromString(NSStringFromClass(type(of: obj))) {
            for method in iterateMethodForClass(cls) {
                methods = methods + generateJSMethod(method, namespace)
            }
        } else {
            XWKWebViewUtil.log("Could not locate corresponding class for obj: \(obj)")
            return ""
        }
        
        return "window.ios['\(namespace)'] = window.ios['\(namespace)'] || {};\(methods)"
    }
    
    func generateJSMethod(_ name: String, _ namespace: String) -> String {
        let promise = name.contains("promise")
        var fn = promise ? name.replacingOccurrences(of: "promise", with: "") : name
        fn = fn.replacingOccurrences(of: ":", with: "")
        
        if ("init" == fn) {
            return ""
        }
        
        let exec =
        """
        try {
            webkit.messageHandlers.\(webkitNamespace).postMessage(JSON.stringify({
                namespace: '\(namespace)',
                method: '\(name)',
                payload,
                \(promise ? "promiseId," : "")
            }));
        } catch(e) { console.log(e) }
        """
        
        return "window.ios['\(namespace)'].\(fn) = function(payload) {\(promise ? wrapInPromise(exec) : exec)};"
    }
    
    func wrapInPromise(_ exec: String) -> String {
        return """
            return new Promise(function(resolve, reject) {
                var promiseId = window.ios.generateUUID();
                window.ios.promises[promiseId] = { resolve, reject };
                \(exec)
            });
        """
    }
}
