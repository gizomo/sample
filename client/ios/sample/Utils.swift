//
//  Utils.swift
//  sample
//
//  Created by Ivan Godenov on 05.02.2025.
//

import Foundation

class Utils {
    public static func unwrapEnvVariable(name: String, defaultValue: String) -> String {
        guard let infoDictionary: [String: Any] = Bundle.main.infoDictionary else { return defaultValue }
        guard let value: String = infoDictionary[name] as? String else { return defaultValue }
        
        return value
    }
    
    public static func ping(uri: String, callback: ((Bool) -> Void)? = nil) {
        if let url = URL(string: uri) {
            let request = URLRequest(url: url)
            URLSession(configuration: .default)
                .dataTask(with: request) { (_, response, error) -> Void in
                    guard nil == error else {
                        callback?(false)
                        return
                    }
                    
                    if let status = (response as? HTTPURLResponse)?.statusCode {
                        guard (status >= 200 && status <= 300) else {
                            print(status)
                            callback?(false)
                            return
                        }
                        
                        callback?(true)
                    } else {
                        callback?(false)
                    }
                }
                .resume()
        } else {
            callback?(false)
        }
    }
}
