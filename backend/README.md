# SonDam Backend

한국 수어 번역 백엔드 API 서버

## 📁 프로젝트 구조

```
backend/
├── 📄 main.py                      # FastAPI 메인 서버
├── 🤖 sign_recognizer.py           # 수어 인식 엔진 (규칙 + ML)
├── 🧠 lstm_model.py                # LSTM 모델 정의
├── 🎓 train_model.py               # 모델 훈련 스크립트
├── 📋 requirements.txt             # Python 의존성
│
├── 📊 data/                        # 수어 사전 데이터
│   └── dictionary_s3.json
│
├── 💾 collected_data/              # ML 훈련용 수집 데이터
│   └── *.json                      # 수어 샘플
│
├── 🎯 models/                      # 훈련된 ML 모델
│   ├── korean_sign_lstm.h5
│   ├── label_map.json
│   └── training_history.png
│
├── 🌐 static/                      # 정적 파일
│   └── collect_data.html           # 데이터 수집 도구
│
├── 📝 blog.md                      # 개발 과정 기록
├── 📖 DATA_COLLECTION_GUIDE.md     # 데이터 수집 가이드
│
└── 🛠️ 유틸리티
    ├── update_thumbnails.py         # S3 썸네일 업로드
    ├── check_s3_permissions.py      # S3 권한 확인
    └── s3_bucket_policy.json        # S3 CORS 설정
```

## 🚀 실행 방법

### 1. 의존성 설치
```bash
cd backend
../.venv/bin/pip install -r requirements.txt
```

### 2. 서버 실행
```bash
../.venv/bin/uvicorn main:app --reload
```

### 3. API 문서 접속
```
http://localhost:8000/docs
```

## 📡 API 엔드포인트

### 수어 사전
- `GET /api/dictionary` - 수어 목록 조회

### 실시간 인식
- `POST /api/recognize` - MediaPipe 랜드마크로 수어 인식
  ```json
  {
    "landmarks": [[x1,y1,z1], [x2,y2,z2], ...]
  }
  ```

## 🧠 ML 모델 훈련

### 1. 데이터 수집
```
http://localhost:8000/static/collect_data.html
```

### 2. 훈련 실행
```bash
../.venv/bin/python train_model.py
```

### 3. 모델 통합
훈련 완료 후 `sign_recognizer.py`가 자동으로 모델 로드

## 🔧 기술 스택

- **Framework**: FastAPI
- **ML**: TensorFlow/Keras, MediaPipe
- **Storage**: AWS S3
- **Language**: Python 3.12+

## 📚 참고 문서

- `blog.md` - 개발 과정 및 디버깅 기록
- `DATA_COLLECTION_GUIDE.md` - 데이터 수집 가이드

## 🧹 프로젝트 정리

디버그/테스트 파일 정리:
```bash
./cleanup.sh
```

---

**Last Updated**: 2026-01-08
