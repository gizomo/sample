//
//  PackagePlugin.swift
//  sample
//
//  Created by Ivan Godenov on 05.02.2025.
//

import Foundation

class PackagePlugin: NSObject {
    @objc func getInfo(_ payload: AnyObject?, promise: XWKWebViewPromise) {
        let appName: String = Utils.unwrapEnvVariable(name: "CFBundleName", defaultValue: "Sample")
        let bundleId: String = Utils.unwrapEnvVariable(name: "CFBundleIdentifier", defaultValue: "Sample.sample")
        let versionName: String = Utils.unwrapEnvVariable(name: "CFBundleVersion", defaultValue: "1.0.0")
        let versionCode: String = Utils.unwrapEnvVariable(name: "VersionCode", defaultValue: "100")
        let versionCommit: String = Utils.unwrapEnvVariable(name: "VersionCommit", defaultValue: "none")
        let versionBranch: String = Utils.unwrapEnvVariable(name: "VersionBranch", defaultValue: "none")
        
        promise.resolve("{\"appName\": \"\(appName)\", \"bundleId\": \"\(bundleId)\", \"versionName\": \"\(versionName)\", \"versionCode\": \(versionCode), \"commit\": \"\(versionCommit)\", \"branch\": \"\(versionBranch)\"}")
    }
}
