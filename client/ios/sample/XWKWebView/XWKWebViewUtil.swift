//
//  XWKWebViewUtil.swift
//  sample
//
//  Created by Ivan Godenov on 15.11.2024.
//

import Foundation

public class XWKWebViewUtil {
    static func log<T>(_ object: T, filename: String = #file, line: Int = #line, funcname: String = #function) {
        if XWKWebView.enableLogging {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "MM/dd/yyyy HH:mm:ss:SSS"
            let process = ProcessInfo.processInfo
            let threadId = "."
            
            NSLog("%@", "\(dateFormatter.string(from: Date())) \(process.processName))[\(process.processIdentifier):\(threadId)] \((filename as NSString).lastPathComponent)(\(line)) \(funcname):\r\t\(object)\n")
        }
    }
}
