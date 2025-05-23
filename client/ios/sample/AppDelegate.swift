//
//  AppDelegate.swift
//  sample
//
//  Created by Ivan Godenov on 15.11.2024.
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    public var deepLinkUrl: URL? = nil

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if let url = launchOptions?[.url] as? URL {
            deepLinkUrl = url
        }

        return true
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        if let url = userActivity.webpageURL {
            deepLinkUrl = url
        }

        return true;
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
            // Called when a new scene session is being created.
            // Use this method to select a configuration to create the new scene with.
            return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
    
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) ->
        UIInterfaceOrientationMask {
            return AppDelegate.orientationLock
        }

    static var orientationLock = UIInterfaceOrientationMask.portrait {
        didSet {
            if #available(iOS 16.0, *) {
                UIApplication.shared.connectedScenes.forEach { scene in
                    if let windowScene = scene as? UIWindowScene {
                        windowScene.requestGeometryUpdate(.iOS(interfaceOrientations: orientationLock))
                    }
                }
                
                UIViewController.attemptRotationToDeviceOrientation()
            } else {
                let orientation = .portrait == orientationLock
                    ? UIInterfaceOrientation.portrait.rawValue
                    : UIInterfaceOrientation.landscapeRight.rawValue
                
                UIDevice.current.setValue(orientation, forKey: "orientation")
            }
        }
    }
}
