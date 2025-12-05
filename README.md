# 🤟 Sign Language: 청각장애인을 위한 실시간 수어 양방향 소통 서비스

<div align="center">
  <img src="https://user-images.githubusercontent.com/79898245/154721052-6da910b3-aba1-4766-b4e8-c71841a43b94.png" width="100%" alt="Project Banner">
  <br><br>
  
  ![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
  ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
  ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
  ![YOLOv3](https://img.shields.io/badge/YOLO-v3-00FFFF?style=for-the-badge&logo=yolo&logoColor=black)
  ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
</div>

---

## 📝 프로젝트 개요 (Overview)

> **"수어(Sign Language)와 음성 언어(Spoken Language)의 장벽을 허물다"**

<div align="center">
  <img src="assets/ui_mockup.png" width="80%" alt="Service UI Mockup">
  <p><em>[서비스 실행 예시 화면]</em></p>
</div>

청각장애인은 수화를 제1언어로 사용하지만, 수화를 모르는 비장애인과의 소통에는 여전히 큰 어려움이 존재합니다. 본 프로젝트는 이러한 **소통의 단절(Communication Gap)**을 해결하기 위해 딥러닝 기반의 컴퓨터 비전 기술을 활용합니다.

**수화 동작을 실시간으로 인식하여 자막으로 번역**하고, 반대로 **음성을 텍스트로 변환**하여 전달하는 양방향 통역 인터페이스를 제공함으로써, 누구나 자유롭게 소통할 수 있는 세상을 지향합니다.

### 🎯 기획 의도
1.  **소통의 장벽 해소**: 전문 수어 통역사 없이도 청각장애인과 비장애인 간의 즉각적이고 원활한 의사소통 지원
2.  **사회적 가치 창출**: 만성적인 수어 통역사 부족 문제 보완 및 청각장애인의 사회적 고립감 해소
3.  **생활 밀착형 지원**: 관공서, 병원 등 필수 생활 공간에서의 독립적인 업무 처리 보조

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 상세 기술 | 비고 |
|:---:|:---|:---|
| **Language** | **Python 3.x** | Core Logic |
| **Framework** | **Flask** | Web Server & Streaming |
| **Vision AI** | **OpenCV, YOLO v3** | Real-time Object Detection |
| **Deep Learning** | **PyTorch** | Model Training |
| **Database** | **MySQL** | Data Management |
| **IDE** | **PyCharm** | Development Environment |

---

## 🔄 시스템 아키텍처 (System Architecture)

<div align="center">
  <img src="assets/system_architecture.png" width="90%" alt="System Architecture Diagram">
</div>

사용자 간의 끊김 없는 소통을 위해 **3단계 순환 인터페이스**를 구축하였습니다.

1.  **MTT (Motion To Text)**
    *   청각장애인의 수화 동작을 카메라로 실시간 인식
    *   딥러닝 모델이 동작을 분석하여 텍스트로 변환 및 화면 출력
2.  **TTS (Text To Speech)**
    *   번역된 텍스트를 비장애인이 청취할 수 있도록 음성으로 합성하여 출력
3.  **STT (Speech To Text)**
    *   비장애인의 음성 답변을 마이크로 수집
    *   텍스트로 변환하여 청각장애인에게 화면으로 전달

---

## 💡 핵심 구현 내용 (Key Features)

### 1. 데이터셋 구축 및 전처리 (Dataset & Preprocessing)
*   **Custom Dataset**: 10가지 주요 수화 동작을 다양한 각도와 조명 환경에서 촬영하여 데이터 확보
*   **Data Labeling**: 이미지 내 손 영역(ROI)을 정밀하게 지정하여 YOLO 학습 포맷에 맞는 라벨링 수행

### 2. 모델 학습 및 최적화 (Training & Optimization)
*   **Training**: 약 10,000장의 커스텀 데이터셋을 활용, 24,000 Iteration 반복 학습 수행
*   **Performance**: Loss 값을 실시간 모니터링하며 과적합(Overfitting) 방지, 최종 **mAP 92%** 수준의 인식 정확도 달성

### 3. 사용자 중심 UI/UX (User Interface)
*   **Scenario-based Design**: 병원, 관공서 등 장소별 맞춤형 시나리오 및 예상 Q&A 매뉴얼 제공
*   **Interactive Chat**:
    *   **Left (User)**: 웹캠 피드와 함께 인식된 수화 텍스트가 말풍선으로 실시간 표시
    *   **Right (System)**: 상대방의 응답 및 시스템 안내 메시지 표시

---

## 🚀 트러블 슈팅 (Troubleshooting)

### Issue 1. 하드웨어 한계 극복 및 범용성 확보
*   **Problem**: 초기 '립모션(Leap Motion)' 센서 사용 시, 손의 위치나 크기에 따라 인식률 편차가 심하고 별도 장비가 필요하다는 단점 발생.
*   **Solution**: **Webcam + Computer Vision (YOLO v3)** 방식으로 전면 전환.
    *   별도 센서 없이 일반 웹캠만으로 사용 가능하도록 범용성 확보.
    *   이미지 패턴 학습을 통해 다양한 손 모양에 대한 강건한(Robust) 인식 성능 확보.

### Issue 2. 실시간 영상 처리 지연 (Latency) 해결
*   **Problem**: 고해상도 영상 송출과 무거운 객체 탐지 모델을 메인 스레드에서 동시에 처리하다 보니 프레임 드랍(Frame Drop) 및 렉(Lag) 발생.
*   **Solution**: **Multi-threading (멀티 스레딩)** 아키텍처 도입.
    *   **Thread A**: 웹캠 영상 캡처 및 웹 스트리밍 전담 (UI 반응성 유지)
    *   **Thread B**: 백그라운드에서 YOLO 객체 탐지 연산 수행 (AI 추론)
    *   **Result**: 끊김 없는 부드러운 화면 송출과 실시간성 높은 수화 인식 동시 달성.

---

## 💻 주요 코드 (Key Code)

**Multi-threading을 활용한 영상 스트리밍 및 YOLO 객체 탐지**

```python
# 카메라 영상을 읽어오는 제너레이터 함수 (Streaming Thread)
def myCamera(camera):
    if not camera.isOpened():
        raise RuntimeError('Camera not found.')

    while True:
        _, frame = camera.read()
        # 프레임을 JPEG로 인코딩하여 실시간 스트리밍
        yield (b'--mycam\r\n'
               b'Content-Type: image/jpeg\r\n\r\n'
               + cv2.imencode('.jpg', cv2.cvtColor(frame, cv2.COLOR_RGBA2RGB))[1].tobytes()
               + b'\r\n')

# YOLO 객체 탐지 수행 함수 (Detection Thread)
def read_cam(camera):
    if not camera.isOpened():
        raise RuntimeError('Camera not found.')

    # YOLO 가중치 및 설정 로드
    YOLO_net = cv2.dnn.readNet("yolov3_last.weights", "yolov3.cfg")
    layer_names = YOLO_net.getLayerNames()
    output_layers = [layer_names[i[0] - 1] for i in YOLO_net.getUnconnectedOutLayers()]

    global pResult # 전역 변수로 결과 공유

    while True:
        _, frame = camera.read()
        h, w, c = frame.shape

        # YOLO 입력 전처리 (Blob)
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        YOLO_net.setInput(blob)
        outs = YOLO_net.forward(output_layers)

        # ... (중략: NMS 및 박스 그리기 로직) ...

        # 결과 업데이트 (상태 변화 감지)
        if pResult != label:
            pResult = label
            print(f"Detected Sign: {pResult}")

# Flask Route
@app.route('/video_feed')
def video_feed():
    camera = cv2.VideoCapture(0)
    
    # 별도 스레드에서 객체 인식(Detection) 실행
    detection_thread = threading.Thread(target=read_cam, args=(camera,))
    detection_thread.daemon = True
    detection_thread.start()

    # 메인 스레드에서는 영상 송출(Streaming) 담당
    return Response(myCamera(camera), mimetype='multipart/x-mixed-replace; boundary=mycam')
```
