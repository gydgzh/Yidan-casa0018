// ContentView.swift (New Version)
// 新架构：全屏 3D 虚拟人 + 右下角真实脸 PIP + 状态栏

import SwiftUI
import ARKit
import WebKit

struct ContentView: View {
    @StateObject private var session = FaceMocapSession(relayURL: kRelayURL)
    @State private var webView: WKWebView?
    @State private var framesToWebView: Int = 0
    
    var body: some View {
        ZStack {
            // 全屏 3D 虚拟人 (WKWebView)
            WebAvatarContainer(webView: $webView)
                .ignoresSafeArea()
                .background(Color.clear)
                .onAppear {
                    // 设置回调
                    session.onFrameCallback = { blendshapes, transform in
                        if let webView = webView {
                            injectARKitData(to: webView, blendshapes: blendshapes, transform: transform)
                            DispatchQueue.main.async {
                                framesToWebView += 1
                            }
                        }
                    }
                }
            
            // 调试信息覆盖层
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("ARK: \(session.framesSent)")
                            .font(.caption.monospaced())
                            .foregroundColor(.green)
                        Text("→WV: \(framesToWebView)")
                            .font(.caption.monospaced())
                            .foregroundColor(.blue)
                    }
                    .padding(8)
                    .background(Color.black.opacity(0.7))
                    .cornerRadius(8)
                    .padding(.trailing, 20)
                    .padding(.bottom, 100)
                }
            }
            
            // 顶部状态栏
            VStack {
                HStack(spacing: 12) {
                    Circle()
                        .fill(session.connected ? .green : .orange)
                        .frame(width: 10, height: 10)
                    Text(session.connected ? "RELAY OK" : "LOCAL ONLY")
                        .font(.caption.monospaced())
                    Spacer()
                    Text(String(format: "%.0f Hz", session.fps))
                        .font(.caption.monospaced())
                    Text(String(format: "%d frames", session.framesSent))
                        .font(.caption.monospaced())
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(.black.opacity(0.55))
                .foregroundStyle(.white)
                .clipShape(Capsule())
                .padding(.top, 50)
                
                Spacer()
            }
        }
        .onAppear { session.start() }
        .onDisappear { session.stop() }
    }
}

/// WebView 容器，用于获取 WKWebView 实例
struct WebAvatarContainer: UIViewRepresentable {
    @Binding var webView: WKWebView?
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // 允许本地文件访问
        if #available(iOS 14.0, *) {
            config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        }
        
        let wv = WKWebView(frame: .zero, configuration: config)
        wv.isOpaque = false
        wv.backgroundColor = .clear
        wv.scrollView.isScrollEnabled = false
        wv.scrollView.bounces = false
        
        DispatchQueue.main.async {
            webView = wv
        }
        
        // 加载本地 bundled web_avatar
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "web_avatar_dist") {
            let folderURL = url.deletingLastPathComponent()
            wv.loadFileURL(url, allowingReadAccessTo: folderURL)
            print("[WebAvatar] Loaded from bundle: \(url)")
            print("[WebAvatar] Base URL: \(folderURL)")
        } else {
            // 备用：远程调试
            if let remoteURL = URL(string: "http://192.168.31.157:5173") {
                wv.load(URLRequest(url: remoteURL))
                print("[WebAvatar] Fallback to remote: \(remoteURL)")
            }
        }
        
        return wv
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

/// 小窗 ARKit 预览（真实脸）
// MARK: - 发送 ARKit 数据到 WebView
func injectARKitData(to webView: WKWebView, blendshapes: [String: Double], transform: simd_float4x4) {
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
        webView.evaluateJavaScript(js) { result, error in
            if let error = error {
                print("[Bridge] JS Error: \(error)")
            }
        }
    }
}
