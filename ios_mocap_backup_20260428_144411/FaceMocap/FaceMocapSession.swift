// FaceMocapSession.swift
// 核心:ARKit ARFaceTrackingConfiguration → ARFaceAnchor → 52 blendshapes →
// JSON over WebSocket(URLSessionWebSocketTask,iOS 13+ 内置,不需要第三方库)。

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
        listen()
    }
    private func listen() {
        ws?.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success:
                self.listen()                               // 继续接收 ping
            case .failure(let err):
                print("[FaceMocap] ws receive error: \(err)")
                Task { @MainActor in self.scheduleReconnect() }
            }
        }
    }
    private func scheduleReconnect() {
        connected = false
        ws?.cancel(with: .abnormalClosure, reason: nil)
        ws = nil
        pendingReconnect?.cancel()
        let work = DispatchWorkItem { [weak self] in
            Task { @MainActor in self?.connectWS() }
        }
        pendingReconnect = work
        DispatchQueue.main.asyncAfter(deadline: .now() + reconnectDelay, execute: work)
        reconnectDelay = min(reconnectDelay * 1.5, 10)
    }

    // MARK: - ARSessionDelegate
    nonisolated func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        guard let face = anchors.compactMap({ $0 as? ARFaceAnchor }).first else { return }

        // 拷一份不可变数据给主线程编码 + 发送。
        var bs: [String: Float] = [:]
        bs.reserveCapacity(face.blendShapes.count)
        for (loc, num) in face.blendShapes {
            bs[loc.rawValue] = num.floatValue
        }
        let head = flatten(face.transform)
        let lEye = flatten(face.leftEyeTransform)
        let rEye = flatten(face.rightEyeTransform)
        let now = Date().timeIntervalSince1970

        Task { @MainActor in
            self.maybeSend(bs: bs, head: head, lEye: lEye, rEye: rEye, ts: now)
        }
    }

    private func maybeSend(bs: [String: Float], head: [Float], lEye: [Float], rEye: [Float], ts: TimeInterval) {
        guard ts - lastSendTS >= minInterval else { return }
        lastSendTS = ts

        let payload: [String: Any] = [
            "ts": ts,
            "blendshapes": bs,
            "head": head, "leftEye": lEye, "rightEye": rEye
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload, options: []),
              let s = String(data: data, encoding: .utf8) else { return }

        ws?.send(.string(s)) { [weak self] err in
            guard let self else { return }
            Task { @MainActor in
                if let err {
                    print("[FaceMocap] ws send error: \(err)")
                    self.scheduleReconnect()
                } else {
                    self.framesSent += 1
                    self.tickFPS(ts)
                }
            }
        }
    }

    private func tickFPS(_ ts: TimeInterval) {
        if fpsWindowStart == 0 { fpsWindowStart = ts }
        fpsWindowCount += 1
        if ts - fpsWindowStart >= 1.0 {
            fps = Double(fpsWindowCount) / (ts - fpsWindowStart)
            fpsWindowStart = ts
            fpsWindowCount = 0
        }
    }
}

// MARK: - simd → [Float]
private func flatten(_ m: simd_float4x4) -> [Float] {
    [
        m.columns.0.x, m.columns.0.y, m.columns.0.z, m.columns.0.w,
        m.columns.1.x, m.columns.1.y, m.columns.1.z, m.columns.1.w,
        m.columns.2.x, m.columns.2.y, m.columns.2.z, m.columns.2.w,
        m.columns.3.x, m.columns.3.y, m.columns.3.z, m.columns.3.w
    ]
}
