# -sign-language
### 청각장애인을 위한 실시간 핸드 시그널 양방향 소통 서비스

<img src="https://user-images.githubusercontent.com/79898245/154721052-6da910b3-aba1-4766-b4e8-c71841a43b94.png" width="100%">

---

## 프로젝트 개요 (Overview)
**"수어(Sign Language)와 음성 언어(Spoken Language)의 장벽을 허물다"**

청각장애인은 수화를 제1언어로 사용하지만, 수화를 모르는 비장애인과의 소통에는 큰 어려움이 따릅니다. 본 프로젝트는 이러한 소통의 단절을 해결하기 위해 딥러닝 기반의 영상 처리를 활용하여 **수화 동작을 실시간으로 인식해 자막으로 번역**하고, 반대로 **음성을 텍스트로 변환**하여 전달하는 양방향 통역 서비스를 개발하였습니다.

### 기획 의도
1. **소통의 장벽 해소:** 수어 통역사 없이도 청각장애인과 비장애인 간의 원활한 의사소통 지원
2. **사회적 비용 절감:** 만성적인 수어 통역사 부족 문제 보완 및 청각장애인의 사회적 고립감 해소
3. **업무 수행 지원:** 관공서, 병원 등 필수적인 생활 공간에서의 업무 처리 보조

---

## 기술 스택 (Tech Stack)

| 구분 | 상세 기술 |
|:---:|:---|
| **Language** | Python 3.x |
| **Framework & Lib** | Flask, OpenCV, YOLO v3, PyTorch |
| **Database** | MySQL |
| **IDE** | PyCharm |

---

## 시스템 아키텍처 (Tech Flow)

사용자 간의 원활한 소통을 위해 **3단계 인터페이스**를 구축하였습니다.

1. **MTT (Motion To Text):** 청각장애인의 수화 동작을 카메라로 인식하여 실시간 텍스트로 변환
2. **TTS (Text To Speech):** 번역된 텍스트를 비장애인이 들을 수 있도록 음성(TTS)으로 출력
3. **STT (Speech To Text):** 비장애인의 음성 답변을 텍스트로 변환하여 화면에 출력

---

## 핵심 구현 내용 (Feature Implementation)

### 1. 데이터셋 구축 및 전처리

* **데이터 확보:** 10가지의 주요 수화 동작을 다양한 각도와 배경에서 촬영하고, 영상을 프레임 단위로 잘라내어 자체 데이터셋을 구축하였습니다.
* **Labeling:** 확보한 이미지 데이터에서 손 영역을 직접 지정하여 YOLO 학습을 위한 라벨링 작업을 수행했습니다.

### 2. 모델 학습 및 최적화

* **학습 진행:** 약 10,000장의 커스텀 데이터셋을 활용하여 24,000번의 반복 학습(Iteration)을 진행했습니다.
* **결과:** Loss(손실율) 값을 지속적으로 모니터링하며 과적합을 방지하였고, 최종적으로 **평균 92%의 인식 정확도**를 달성한 가중치 파일을 생성하였습니다.

### 3. 서비스 시나리오 및 UI

* **시나리오 기반 설계:** 병원, 관공서 등 자주 방문하는 장소를 카테고리화하여 상황에 맞는 예상 질문과 답변 매뉴얼을 제공합니다.
* **채팅 인터페이스:**
    * **Left (User):** 웹캠을 통해 자신의 수화 모습을 확인하며 입력. 인식된 수화는 텍스트로 자동 변환되어 말풍선에 표시됩니다.
    * **Right (System/Counterpart):** 상대방의 응대 매뉴얼 질문이 표시되며, 음성 인식(STT)을 통해 추가적인 대화가 가능합니다.

---

## 트러블 슈팅 (Problem & Solution)

### Issue 1. 하드웨어 인식의 한계와 기술 전환
초기에는 '립모션(Leap Motion)' 센서를 활용하여 손가락의 기울기와 좌표를 분석하려 했습니다. 하지만 실제 테스트 결과, 센서 위에서의 손 위치에 따라 **인식률이 불안정**하고, 사용자마다 손의 크기나 동작 범위가 달라 일관된 데이터를 얻기 힘들었습니다.
> **Solution:** 하드웨어 의존도를 낮추고 범용성을 높이기 위해 **웹캠 기반의 영상 처리(Computer Vision)** 방식으로 전환하였습니다. **YOLO v3** 객체 탐지 모델을 도입하여 이미지 자체의 패턴을 학습시킴으로써 인식률을 비약적으로 향상시켰습니다.

### Issue 2. 실시간 영상 처리 지연(Lag) 해결
객체 인식 모델이 무거워 실시간 웹 스트리밍 시 프레임 드랍과 끊김 현상이 발생했습니다. 메인 스레드에서 영상 송출과 객체 탐지를 동시에 처리하는 것이 원인이었습니다.
> **Solution:** **멀티 스레딩(Multi-threading)** 기법을 적용하여 역할을 분리하였습니다.
> * Thread 1: 웹캠 영상을 실시간으로 읽어와 웹으로 송출
> * Thread 2: 백그라운드에서 YOLO 모델을 통해 객체 탐지 수행
>
> 이를 통해 끊김 없는 부드러운 화면 송출과 동시에 높은 정확도의 수화 인식이 가능해졌습니다.

---

## 주요 코드 (Key Code)

**영상 스트리밍 및 YOLO 객체 탐지 병렬 처리**

```python
# 카메라 영상을 읽어오는 함수 (Generator)
def myCamera(camera):
    if not camera.isOpened():
        raise RuntimeError('연결된 카메라가 있는지 확인 요함.')

    while True:
        _, frame = camera.read()
        # 프레임을 JPG로 인코딩하여 스트리밍
        yield (b'--mycam\r\n'
               b'Content-Type: image/jpeg\r\n\r\n'
               + cv2.imencode('.jpg', cv2.cvtColor(frame, cv2.COLOR_RGBA2RGB))[1].tobytes()
               + b'\r\n')

# 별도 스레드에서 실행될 YOLO 감지 함수
def read_cam(camera):
    if not camera.isOpened():
        raise RuntimeError('연결된 카메라가 있는지 확인 요함.')

    # YOLO 가중치 파일 및 설정 로드
    YOLO_net = cv2.dnn.readNet("yolov3_last.weights", "yolov3.cfg")
    
    # 클래스 이름 로드
    classes = []
    with open("classes.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]
    
    layer_names = YOLO_net.getLayerNames()
    output_layers = [layer_names[i[0] - 1] for i in YOLO_net.getUnconnectedOutLayers()]

    while True:
        _, frame = camera.read()
        h, w, c = frame.shape

        # YOLO 입력 전처리 (Blob 생성)
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        YOLO_net.setInput(blob)
        outs = YOLO_net.forward(output_layers)

        class_ids = []
        confidences = []
        boxes = []

        # 감지된 객체 정보 추출
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]

                if confidence > 0.5: # 신뢰도 0.5 이상인 경우만 검출
                    center_x = int(detection[0] * w)
                    center_y = int(detection[1] * h)
                    dw = int(detection[2] * w)
                    dh = int(detection[3] * h)
                    
                    x = int(center_x - dw / 2)
                    y = int(center_y - dh / 2)
                    boxes.append([x, y, dw, dh])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

        # NMS(Non-Maximum Suppression)로 중복 박스 제거
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.45, 0.4)

        for i in range(len(boxes)):
            if i in indexes:
                x, y, w, h = boxes[i]
                label = str(classes[class_ids[i]])
                
                # 감지된 수화 동작에 사각형 및 라벨 표시
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 5)
                cv2.putText(frame, label, (x, y - 20), cv2.FONT_ITALIC, 0.5, (255, 255, 255), 1)

                # 결과값 업데이트 (중복 방지 로직 포함)
                global pResult
                if pResult != label:
                    pResult = label
                    print(f"Detected: {pResult}")

# Flask 라우트: 멀티 스레딩 적용
@app.route('/video_feed')
def video_feed():
    camera = cv2.VideoCapture(0)
    
    # 객체 인식을 위한 별도 스레드 시작
    cam2 = threading.Thread(target=read_cam, args=(camera,))
    cam2.start()

    # 웹 화면 송출
    return Response(myCamera(camera), mimetype='multipart/x-mixed-replace; boundary=mycam')
