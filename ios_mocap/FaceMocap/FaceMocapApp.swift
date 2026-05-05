// FaceMocapApp.swift
// CASA0018 - Face Motion Capture (ARKit) → Web Avatar
//
// 入口 + 全局常量。把 kRelayURL 改成你 Mac 的 LAN 地址。

import SwiftUI

// 改成你 Mac 的 WiFi IP。在 Mac 上运行: ifconfig | grep "inet " | grep -v 127.0.0.1
let kRelayURL = URL(string: "ws://192.168.31.157:8765")!

@main
struct FaceMocapApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
