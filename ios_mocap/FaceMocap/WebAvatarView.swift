// WebAvatarView.swift
// WKWebView 包装器：加载本地 bundled web_avatar，通过 JS Bridge 接收 ARKit 数据

import SwiftUI
import WebKit

/// 暴露给 WKWebView 的 JS Bridge
class WebAvatarBridge: NSObject, WKScriptMessageHandler {
    var onBlendshapes: (([String: Double], [[Double]]) -> Void)?
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "arkitBridge",
              let body = message.body as? [String: Any] else { return }
        
        // 解析 blendshapes
        if let blendshapes = body["blendshapes"] as? [String: Double],
           let matrix = body["transform"] as? [[Double]] {
            onBlendshapes?(blendshapes, matrix)
        }
    }
}

struct WebAvatarView: UIViewRepresentable {
    let bridge = WebAvatarBridge()
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.allowsInlineMediaPlayback = true
        
        // 注入 JS Bridge
        config.userContentController.add(bridge, name: "arkitBridge")
        
        // 允许本地文件访问
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        
        // 加载本地 bundled web_avatar
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "web_avatar_dist") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            // 备用：加载远程（开发调试用）
            if let remoteURL = URL(string: "http://192.168.31.157:5173") {
                webView.load(URLRequest(url: remoteURL))
            }
        }
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    
    /// 发送 ARKit 数据到 WebView
    func sendToWebView(blendshapes: [String: Double], transform: simd_float4x4) {
        // 转换 matrix 为数组
        var matrixArray: [[Double]] = []
        for row in 0..<4 {
            var rowArray: [Double] = []
            for col in 0..<4 {
                rowArray.append(Double(transform[row][col]))
            }
            matrixArray.append(rowArray)
        }
        
        // 构建 JSON
        let dict: [String: Any] = [
            "blendshapes": blendshapes,
            "transform": matrixArray,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let js = "window.receiveARKitData(\(jsonString))"
            // 需要在 updateUIView 中获取 webView 实例执行
        }
    }
}

// MARK: - 用于外部调用发送数据的扩展
extension WebAvatarView {
    static func injectData(to webView: WKWebView, blendshapes: [String: Double], transform: simd_float4x4) {
        var matrixArray: [[Double]] = []
        for row in 0..<4 {
            var rowArray: [Double] = []
            for col in 0..<4 {
                rowArray.append(Double(transform[row][col]))
            }
            matrixArray.append(rowArray)
        }
        
        let dict: [String: Any] = [
            "blendshapes": blendshapes,
            "transform": matrixArray,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: dict),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            let js = "window.receiveARKitData(\(jsonString))"
            webView.evaluateJavaScript(js) { _, _ in }
        }
    }
}
