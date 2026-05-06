// ContentView.swift
// 一个全屏的 ARKit face tracking 视图 + 顶部状态栏(连接状态 + 帧率)。

import SwiftUI
import ARKit

struct ContentView: View {
    @StateObject private var session = FaceMocapSession(relayURL: kRelayURL)

    var body: some View {
        ZStack(alignment: .top) {
            ARFaceView(session: session)
                .ignoresSafeArea()

            HStack(spacing: 12) {
                Circle()
                    .fill(session.connected ? .green : .red)
                    .frame(width: 10, height: 10)
                Text(session.connected ? "RELAY OK" : "RELAY DOWN")
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
        }
        .onAppear  { session.start() }
        .onDisappear { session.stop() }
    }
}

/// SwiftUI 包装一个 ARSCNView,只用作 ARKit pipeline 宿主(我们不渲染 3D 内容)。
struct ARFaceView: UIViewRepresentable {
    let session: FaceMocapSession

    func makeUIView(context: Context) -> ARSCNView {
        let v = ARSCNView()
        v.session = session.arSession
        v.automaticallyUpdatesLighting = true
        v.rendersCameraGrain = false
        return v
    }
    func updateUIView(_ uiView: ARSCNView, context: Context) {}
}
