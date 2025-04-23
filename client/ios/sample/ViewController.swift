//
//  ViewController.swift
//  sample
//
//  Created by Ivan Godenov on 15.11.2024.
//

import UIKit
import WebKit

class ViewController: UIViewController, UIGestureRecognizerDelegate, WKNavigationDelegate {
    private var xwebview: XWKWebView!
    private var webView: WKWebView!
    private var chevron: Chevron!
    private var alert: UIAlertController?
    private var timer: Timer = Timer()
    
    private static var autohideHomeIndicator: Bool = false
    private static var instance: ViewController!

    override func viewDidLoad() {
        super.viewDidLoad()

        let versionName: String = Utils.unwrapEnvVariable(name: "CFBundleVersion", defaultValue: "1.0.0")
        let versionCode: String = Utils.unwrapEnvVariable(name: "VersionCode", defaultValue: "100")
        let versionCommit: String = Utils.unwrapEnvVariable(name: "VersionCommit", defaultValue: "none")
        let versionBranch: String = Utils.unwrapEnvVariable(name: "VersionBranch", defaultValue: "none")

        NSLog("%@", "ipa-\(versionName)-\(versionCode)-\(versionCommit)-\(versionBranch)")
        
        ViewController.instance = self
        
        timer.invalidate()

        chevron = Chevron(frame: CGRect(x: 0, y: view.frame.height / 2 - 20, width: 15, height: 40))

        let webViewConf = WKWebViewConfiguration()
        webViewConf.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: webViewConf)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .launchBackground
        webView.underPageBackgroundColor = .launchBackground
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.bounces = false

        let swipeLeftEdge = UIScreenEdgePanGestureRecognizer(target: self, action: #selector(backNavigationFunction(_:)))
        swipeLeftEdge.edges = .left
        swipeLeftEdge.delegate = self
        
        let swipeRightEdge = UIScreenEdgePanGestureRecognizer(target: self, action: #selector(backNavigationFunction(_:)))
        swipeRightEdge.edges = .right
        swipeRightEdge.delegate = self
        
        view.addGestureRecognizer(swipeLeftEdge)
        view.addGestureRecognizer(swipeRightEdge)
        view.addSubview(webView)
        view.addSubview(chevron)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])

        if #available(iOS 11.0, *) {
            webView.scrollView.contentInsetAdjustmentBehavior = .never;
        }

        if webView.responds(to: Selector(("setInspectable:"))) {
            webView.perform(Selector(("setInspectable:")), with: true)
        }
        
        var websiteDataTypes = WKWebsiteDataStore.allWebsiteDataTypes()
        websiteDataTypes.remove("WKWebsiteDataTypeLocalStorage")
        
        WKWebsiteDataStore.default().removeData(
            ofTypes: websiteDataTypes,
            modifiedSince: Date(timeIntervalSince1970: 0),
            completionHandler: {}
        )

        xwebview = XWKWebView(webView, ["system": SystemPlugin(), "package": PackagePlugin()])
        
        start()
    }
    
    public static func setAutohideHomeIndicator(value: Bool) {
        ViewController.autohideHomeIndicator = value
        ViewController.instance.setNeedsUpdateOfHomeIndicatorAutoHidden()
    }
    
    override var prefersHomeIndicatorAutoHidden: Bool {
        return ViewController.autohideHomeIndicator
    }
    
    func getProtalUrl() -> URL {
        let delegate = UIApplication.shared.delegate as! AppDelegate
        let portalDomain: String = Utils.unwrapEnvVariable(name: "AssociatedUrl", defaultValue: "192.168.1.82:8081")
        let portalScheme: String = Utils.unwrapEnvVariable(name: "AssociatedScheme", defaultValue: "http")
        
        return delegate.deepLinkUrl ?? URL(string: portalScheme + "://" + portalDomain)!
    }
    
    func start() {
        let portalUrl: URL = getProtalUrl()
        NSLog("%@", portalUrl.absoluteString)
        webView.load(URLRequest(url: portalUrl))
    }
    
    func reconnectTimer() {
        if (!timer.isValid) {
            showAlert()
        }
        
        timer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { timer in
            let portalUrl: URL = self.getProtalUrl()
            Utils.ping(uri: portalUrl.absoluteString) { result in
                DispatchQueue.main.async {
                    if (result) {
                        timer.invalidate()
                        self.dismissAlert()
                        self.start()
                    }
                }
            }
        }
    }
    
    func showAlert() {
        if (nil == alert) {
            alert = UIAlertController(title: nil, message: String(localized: "connection_error_message"), preferredStyle: .alert)
            self.present(alert!, animated: false, completion: nil)
        }
    }
    
    func dismissAlert() {
        if (nil != alert) {
            alert?.dismiss(animated: false, completion: nil)
            alert = nil
        }
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        reconnectTimer()
    }
    
    override open var shouldAutorotate: Bool {
        return false
    }

    @objc func backNavigationFunction(_ sender: UIScreenEdgePanGestureRecognizer) {
        let dX = sender.translation(in: view).x
        let value = abs(dX / (view.bounds.width * 0.25))
        
        if (sender.edges == .left) {
            chevron.animateFromLeft(value: value)
        }

        if (sender.edges == .right) {
            chevron.animateFromRight(value: value)
        }

        if sender.state == .ended {
            let fraction = abs(dX / view.bounds.width)

            if fraction >= 0.35 {
                webView.goBack()
            }

            chevron.hide()
        }
    }
}
