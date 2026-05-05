// nativeBridge.js
// iOS App 与 WebView 之间的 JS Bridge，替代 WebSocket

(function() {
  'use strict';

  // 全局数据接收函数（iOS 会调用这个）
  window.receiveARKitData = function(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('[Bridge] Failed to parse ARKit data:', e);
        return;
      }
    }
    
    // 触发事件给 main.js
    const event = new CustomEvent('arkitData', { detail: data });
    window.dispatchEvent(event);
    
    // 同时支持回调方式
    if (window.onARKitData) {
      window.onARKitData(data);
    }
  };

  // 检测运行环境
  window.isNativeApp = function() {
    return window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.arkitBridge;
  };

  // 向 iOS 发送消息（如果需要双向通信）
  window.sendToNative = function(message) {
    if (window.isNativeApp()) {
      window.webkit.messageHandlers.arkitBridge.postMessage(message);
    }
  };

  // 模拟数据（用于浏览器调试）
  window.simulateARKitData = function() {
    const simulatedData = {
      blendshapes: {
        eyeBlinkLeft: 0,
        eyeBlinkRight: 0,
        jawOpen: 0.1,
        mouthSmileLeft: 0.3,
        mouthSmileRight: 0.3,
        browInnerUp: 0.1
      },
      transform: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ],
      timestamp: Date.now() / 1000
    };
    window.receiveARKitData(simulatedData);
  };

  console.log('[Bridge] Native bridge initialized. isNativeApp:', window.isNativeApp());
})();
