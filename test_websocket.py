import asyncio
import websockets
import json
import time

# 模拟 blendshape 数据
def generate_blendshape_frame():
    """生成模拟的 52-d blendshape 数据"""
    import random
    blendshapes = {}
    # 基础表情
    categories = [
        "browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight",
        "cheekPuff", "cheekSquintLeft", "cheekSquintRight", "eyeBlinkLeft", "eyeBlinkRight",
        "eyeLookDownLeft", "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight",
        "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight",
        "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
        "jawForward", "jawLeft", "jawOpen", "jawRight",
        "mouthClose", "mouthDimpleLeft", "mouthDimpleRight", "mouthFrownLeft", "mouthFrownRight",
        "mouthFunnel", "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight",
        "mouthPressLeft", "mouthPressRight", "mouthPucker", "mouthRight",
        "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper",
        "mouthSmileLeft", "mouthSmileRight", "mouthStretchLeft", "mouthStretchRight",
        "mouthUpperUpLeft", "mouthUpperUpRight", "noseSneerLeft", "noseSneerRight",
        "tongueOut"
    ]
    for cat in categories:
        blendshapes[cat] = random.random() * 0.3  # 低强度随机值
    
    # 偶尔添加微笑
    if random.random() > 0.7:
        blendshapes["mouthSmileLeft"] = 0.8
        blendshapes["mouthSmileRight"] = 0.8
    
    return {
        "blendshapes": blendshapes,
        "timestamp": time.time()
    }

async def test_sender():
    uri = "ws://localhost:8765"
    print(f"Connecting to {uri}...")
    
    async with websockets.connect(uri) as websocket:
        # 发送 role 标识
        await websocket.send(json.dumps({"role": "sender"}))
        print("Connected as sender")
        
        # 发送 30 帧测试数据
        for i in range(30):
            frame = generate_blendshape_frame()
            await websocket.send(json.dumps(frame))
            print(f"Sent frame {i+1}/30")
            await asyncio.sleep(0.033)  # 30fps
        
        print("Test complete!")

async def test_viewer():
    uri = "ws://localhost:8765"
    print(f"Connecting as viewer to {uri}...")
    
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"role": "viewer"}))
        print("Connected as viewer, waiting for data...")
        
        count = 0
        while count < 10:
            try:
                msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(msg)
                if "blendshapes" in data:
                    count += 1
                    print(f"Received frame {count}: {len(data['blendshapes'])} blendshapes")
            except asyncio.TimeoutError:
                print("Timeout waiting for data")
                break
        
        print(f"Received {count} frames")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "viewer":
        asyncio.run(test_viewer())
    else:
        asyncio.run(test_sender())
