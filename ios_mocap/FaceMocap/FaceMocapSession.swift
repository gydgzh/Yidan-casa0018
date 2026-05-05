// FaceMocapSession.swift (Updated with onFrame callback)
// 核心: ARKit ARFaceTrackingConfiguration → ARFaceAnchor → 52 blendshapes
// 支持 WebSocket 发送 + 本地回调给 WKWebView

import Foundation
import ARKit
import simd
import Combine

@MainActor
final class FaceMocapSession: NSObject, ObservableObject, ARSessionDelegate {

    // 给 UI 显示用
    @Published var connected: Bool = false
    @Published var fps: Double = 0
    @Published var framesSent: Int = 0
    
    // 新增：每帧回调给本地 WebView
    var onFrameCallback: (([String: Double], simd_float4x4) -> Void)?

    let arSession = ARSession()

    // MARK: - Private state
    private let relayURL: URL
    private var ws: URLSessionWebSocketTask?
    private let urlSession: URLSession
    private var pendingReconnect: DispatchWorkItem?
    private var reconnectDelay: TimeInterval = 2

    private var lastSendTS: TimeInterval = 0
    private let minInterval: TimeInterval = 1.0 / 30.0   // 30 Hz 上限
    private var fpsWindowStart: TimeInterval = 0
    private var fpsWindowCount: Int = 0
    
    // ARKit 52 个 blendshape 名称（与 ARKit 文档一致）
    private let blendShapeNames: [ARFaceAnchor.BlendShapeLocation] = [
        .eyeBlinkLeft, .eyeLookDownLeft, .eyeLookInLeft, .eyeLookOutLeft, .eyeLookUpLeft,
        .eyeSquintLeft, .eyeWideLeft, .eyeBlinkRight, .eyeLookDownRight, .eyeLookInRight,
        .eyeLookOutRight, .eyeLookUpRight, .eyeSquintRight, .eyeWideRight, .jawForward,
        .jawLeft, .jawRight, .jawOpen, .mouthClose, .mouthFunnel, .mouthPucker,
        .mouthLeft, .mouthRight, .mouthSmileLeft, .mouthSmileRight, .mouthFrownLeft,
        .mouthFrownRight, .mouthDimpleLeft, .mouthDimpleRight, .mouthStretchLeft,
        .mouthStretchRight, .mouthRollLower, .mouthRollUpper, .mouthShrugLower,
        .mouthShrugUpper, .mouthPressLeft, .mouthPressRight, .mouthLowerDownLeft,
        .mouthLowerDownRight, .mouthUpperUpLeft, .mouthUpperUpRight, .browDownLeft,
        .browDownRight, .browInnerUp, .browOuterUpLeft, .browOuterUpRight, .cheekPuff,
        .cheekSquintLeft, .cheekSquintRight, .noseSneerLeft, .noseSneerRight, .tongueOut
    ]

    init(relayURL: URL) {
        self.relayURL = relayURL
        let cfg = URLSessionConfiguration.default
        cfg.waitsForConnectivity = true
        self.urlSession = URLSession(configuration: cfg)
        super.init()
        arSession.delegate = self
    }

    // MARK: - Lifecycle
    func start() {
        guard ARFaceTrackingConfiguration.isSupported else {
            print("[FaceMocap] 此设备不支持 ARFaceTracking(需要 TrueDepth)。")
            return
        }
        let cfg = ARFaceTrackingConfiguration()
        cfg.maximumNumberOfTrackedFaces = 1
        cfg.isLightEstimationEnabled = true
        arSession.run(cfg, options: [.removeExistingAnchors, .resetTracking])
        connectWS()
    }

    func stop() {
        arSession.pause()
        ws?.cancel(with: .normalClosure, reason: nil)
        pendingReconnect?.cancel()
    }

    // MARK: - WebSocket
    private func connectWS() {
        let task = urlSession.webSocketTask(with: relayURL)
        task.resume()
        ws = task
        connected = true
        reconnectDelay = 2
        receiveLoop()
    }

    private func reconnect() {
        guard pendingReconnect == nil else { return }
        connected = false
        let work = DispatchWorkItem { [weak self] in
            self?.pendingReconnect = nil
            self?.connectWS()
        }
        pendingReconnect = work
        DispatchQueue.main.asyncAfter(deadline: .now() + reconnectDelay, execute: work)
        reconnectDelay = min(reconnectDelay * 2, 30)
    }

    private func receiveLoop() {
        ws?.receive { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .failure: self.reconnect()
            case .success: self.receiveLoop()
            }
        }
    }

    // MARK: - ARSessionDelegate
    nonisolated func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let face = anchors.compactMap({ $0 as? ARFaceAnchor }).first else { return }
        
        // 提取 52 维 blendshapes
        var blendshapes: [String: Double] = [:]
        for key in blendShapeNames {
            if let value = face.blendShapes[key] {
                blendshapes[key.rawValue] = Double(value)
            }
        }
        
        // 头部 4x4 变换矩阵
        let transform = face.transform
        
        Task { @MainActor in
            send(blendshapes: blendshapes, transform: transform)
            
            // 本地回调给 WebView（优先）
            if let callback = onFrameCallback {
                callback(blendshapes, transform)
            }
        }
    }

    private func send(blendshapes: [String: Double], transform: simd_float4x4) {
        let now = Date().timeIntervalSince1970
        guard now - lastSendTS >= minInterval else { return }
        lastSendTS = now

        // FPS 计算
        if now - fpsWindowStart >= 1.0 {
            fps = Double(fpsWindowCount) / (now - fpsWindowStart)
            fpsWindowStart = now
            fpsWindowCount = 0
        }
        fpsWindowCount += 1
        framesSent += 1

        // 构建 JSON
        var matrix: [[Double]] = []
        for row in 0..<4 {
            var r: [Double] = []
            for col in 0..<4 { r.append(Double(transform[row][col])) }
            matrix.append(r)
        }

        let payload: [String: Any] = [
            "ts": now,
            "blendshapes": blendshapes,
            "head": matrix
        ]

        guard let data = try? JSONSerialization.data(withJSONObject: payload) else { return }

        // WebSocket 发送
        ws?.send(.data(data)) { [weak self] error in
            if let _ = error { self?.reconnect() }
        }
    }
}
