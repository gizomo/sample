//
//  IOSBridge.swift
//  sample
//
//  Created by Ivan Godenov on 16.11.2024.
//

import UIKit
import Foundation

class SystemPlugin: NSObject {
    @objc func getInfo(_ payload: AnyObject?, promise: XWKWebViewPromise) {
        promise.resolve(UIDevice.current.systemName + " - " + UIDevice.current.systemVersion)
    }
    
    @objc func getDeviceId(_ payload: AnyObject?, promise: XWKWebViewPromise) {
        promise.resolve(UIDevice.current.identifierForVendor!.uuidString)
    }

    @objc func setOrientation(_ payload: Dictionary<String, String>?) {
        if let orientation = payload?["type"] {
            AppDelegate.orientationLock = "portrait" == orientation ? UIInterfaceOrientationMask.portrait : UIInterfaceOrientationMask.landscape
        }
    }

    @objc func openUrl(_ payload: Dictionary<String, String>?, promise: XWKWebViewPromise) {
        if let scheme = payload?["url"] {
            if let url = URL(string: scheme) {
                UIApplication.shared.open(url, options: [:], completionHandler: {
                  (success) in
                    promise.resolve(scheme)
                })
            } else {
                promise.reject("The url is invalid");
            }
        } else {
            promise.reject("There is no url");
        }
    }

    @objc func nativeLog(_ payload: Dictionary<String, String>?) {
        if let message = payload?["message"] {
            NSLog("%@", message)
        }
    }
    
    @objc func setHomeIndicator(_ payload: Dictionary<String, Bool>?) {
        if let autohide = payload?["autohide"] {
            ViewController.setAutohideHomeIndicator(value: autohide)
        } else {
            ViewController.setAutohideHomeIndicator(value: false)
        }
    }
    
    @objc func closeApp(_ payload: AnyObject?) {
        exit(0)
    }
}
