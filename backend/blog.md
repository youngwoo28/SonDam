# SonDam 개발 일지

> 한국 수어 번역 웹 애플리케이션 개발 과정 기록

---

## 프로젝트 개요

**프로젝트명**: SonDam (손담)  
**목적**: AI 기반 한국 수어 실시간 번역 서비스  
**기간**: 2025.12 ~ 2026.01  
**기술 스택**: Next.js, FastAPI, MediaPipe, TensorFlow/LSTM

---

## 주요 기능 구현

### 1. 수어 사전 (Dictionary)
- **구현**: FastAPI 백엔드 `/api/dictionary` 엔드포인트
- **데이터**: S3 버킷에서 동영상 로딩
- **문제 해결**:
  - ❌ 초기: 외부 YouTube 링크 → 비디오 재생 불가
  - ✅ 해결: S3 직접 업로드 후 정적 파일 서빙
  - 📁 관련 디버그 파일: `debug_list_*.html`, `debug_output_*.txt`

### 2. 실시간 번역 (AI Translator)
- **Phase 1**: 규칙 기반 인식
  - MediaPipe 손 랜드마크 감지
  - 기하학적 패턴 매칭 (손가락 개수, 방향)
  - **버그 수정**: 엄지척 vs 1개 손가락 구분 문제
  
- **Phase 2**: ML 기반 인식 (진행 중)
  - LSTM 모델 아키텍처 구현
  - 데이터 수집 도구 개발
  - TensorFlow 통합

---

## 디버깅 과정 기록

### 사전 기능 디버깅

#### 문제 1: S3 버킷 CORS 오류
**증상**: 브라우저에서 S3 비디오 로드 실패
**해결**: 
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"]
}
```
📁 파일: `s3_bucket_policy.json`

#### 문제 2: 썸네일 이미지 404
**증상**: 사전 카드에 이미지 표시 안됨
**원인**: S3 경로 불일치
**해결**: `update_thumbnails.py` 스크립트로 일괄 업로드

**디버그 파일들**:
- `debug_detail.html` - 상세 페이지 HTML 구조 확인
- `debug_list_*.html` (1-8) - 사전 목록 API 응답 분석
- `debug_output_*.txt` - 콘솔 로그 및 에러 메시지
- `test_requests.py` - API 엔드포인트 테스트
- `test_requests_result.html` - 테스트 결과 저장

### 비디오 재생 디버깅

#### 문제 3: 동영상 정적 이미지로 표시
**증상**: `<video>` 태그가 작동하지 않음
**시도한 방법들**:
1. YouTube iframe 임베드 → 외부 링크 깨짐
2. 직접 다운로드 후 로컬 서빙 → 경로 문제
3. S3 정적 파일 서빙 → **성공!**

**관련 파일**:
- `test_video_ajax.html` - AJAX 비디오 로딩 테스트
- `debug_search.html` - 검색 기능 디버깅

### MediaPipe 카메라 통합

#### 문제 4: 카메라 피드 표시 안됨
**증상**: 검은 화면
**원인**: 
- `facingMode: "environment"` (후면 카메라) 설정
- 노트북에는 후면 카메라 없음

**해결**: `facingMode: "user"` (전면 카메라)로 변경

#### 문제 5: API 호출 과부하
**증상**: `ERR_NETWORK_IO_SUSPENDED`
**원인**: 매 프레임(60fps)마다 API 호출
**해결**: Throttling (500ms마다 1회)

---

## ML 모델 개발

### 규칙 기반 → ML 기반 전환

#### 현재 상태 (규칙 기반)
```python
# 손가락 개수 기반
if fingers_extended == 5: return "안녕"
if fingers_extended == 0: return "감사"
if is_thumbs_up(): return "괜찮다"
```

**한계**:
- 엄지척 vs 손가락 1개 구분 어려움
- 복잡한 동작 인식 불가
- 확장성 부족

#### ML 모델 설계 (LSTM)

**아키텍처**:
```
Input: (30 frames, 63 features)
  ↓
LSTM(128) + Dropout(0.3)
  ↓
LSTM(64) + Dropout(0.3)
  ↓
LSTM(32) + Dropout(0.2)
  ↓
Dense(64) + Dropout(0.2)
  ↓
Dense(10, softmax)
```

**데이터 수집**:
- 목표: 10개 수어 × 50-100 샘플
- 도구: `static/collect_data.html`
- 형식: JSON (landmarks sequences)

**훈련 파이프라인**:
1. `lstm_model.py` - 모델 정의
2. `train_model.py` - 훈련 스크립트
3. Early stopping, ReduceLROnPlateau

---

## 프로젝트 정리

### 삭제할 파일들 (임시/디버그)

#### 디버그 HTML (16개)
- `debug_detail.html`
- `debug_error.html`
- `debug_list_*.html` (1-8)
- `debug_main.html`
- `debug_search.html`
- `test_detail.html`
- `test_requests_result.html`
- `test_video_ajax.html`

#### 디버그 텍스트 (16개)
- `debug_output*.txt` (모든 변형)

#### 테스트 스크립트 (3개)
- `test_guess.py`
- `test_requests.py`
- `auto_collector.py` (미사용)
- `fix_driver.py` (미사용)

### 유지할 핵심 파일

#### 백엔드 코어
- `main.py` - FastAPI 메인
- `sign_recognizer.py` - 수어 인식기
- `lstm_model.py` - LSTM 모델
- `train_model.py` - 훈련 스크립트
- `requirements.txt` - 의존성

#### 데이터/설정
- `data/` - 사전 데이터
- `collected_data/` - ML 훈련 데이터
- `models/` - 훈련된 모델
- `static/` - 정적 파일 (수집 도구)
- `s3_bucket_policy.json` - S3 설정
- `DATA_COLLECTION_GUIDE.md` - 가이드

#### 유틸리티
- `update_thumbnails.py` - S3 업로드
- `check_s3_permissions.py` - S3 권한 확인

---

## 기술적 의사결정

### 1. 왜 FastAPI?
- ✅ 빠른 성능 (async/await)
- ✅ 자동 API 문서 (Swagger)
- ✅ Python ML 라이브러리와 호환성

### 2. 왜 LSTM?
- ✅ 시계열 데이터 (비디오 프레임) 처리
- ✅ 장기 의존성 학습
- ✅ 검증된 아키텍처 (논문 참조)

### 3. 왜 MediaPipe?
- ✅ 실시간 성능 (브라우저)
- ✅ 정확한 손 랜드마크 추출
- ✅ 무료 오픈소스

### 4. 데이터 저장: S3 vs 로컬?
- **초기**: 로컬 개발
- **장기**: AWS S3
  - 확장성
  - 팀 협업
  - 자동 백업

---

## 배운 점

### 기술적
1. **MediaPipe 통합**
   - 동적 import로 Next.js 빌드 에러 방지
   - 프레임 처리 최적화 (throttling)

2. **API 디버깅**
   - HTML 응답 파일로 구조 분석
   - 텍스트 로그로 에러 추적
   - 단계별 격리 테스트

3. **ML 워크플로우**
   - 데이터 품질 > 모델 복잡도
   - 규칙 기반 → ML 단계적 전환

### 프로젝트 관리
1. **버전 관리**
   - 디버그 파일은 임시
   - blog.md로 히스토리 기록
   - 깔끔한 구조 유지

2. **문서화**
   - README.md: 프로젝트 소개
   - blog.md: 개발 과정
   - 가이드 문서: 사용법

---

## 3D 아바타 구현 (2026.01.13 업데이트)

### 1. 텍스트 → 수어 시각화 (Text-to-Sign)
- **목표**: 텍스트 입력 시 3D 모델이 수어 동작 수행
- **기술**: React Three Fiber (R3F), WebGL, MediaPipe Landmarks

### 2. 시행착오 기록 (The Trial and Error)

#### ❌ 문제 1: WebGL Context Lost (성능 이슈)
- **증상**: 애니메이션 재생 도중 화면이 검게 변하고 브라우저 경고 발생.
- **원인**: 리액트 상태(State)가 매 프레임(60fps) 변경되면서 캔버스를 무리하게 재렌더링함.
- **해결**:
  - `useState` 대신 `useRef`를 사용하여 리렌더링 없이 직접 DOM/Mesh 조작.
  - 리액트 사이클 외부의 **Imperative Loop** 방식 도입.

#### ❌ 문제 2: "무섭다" (불쾌한 골짜기)
- **시도 1 (Skeleton)**: 관절(공)과 뼈(선)만 있는 구조.
  - **피드백**: "해골 같아서 무섭다."
- **시도 2 (Solid Hand)**: 두꺼운 기하 도형(Capsule)으로 살을 붙임.
  - **피드백**: "손이 아니라 감자 덩어리나 진흙 괴물 같다." (모양 제어 실패)

#### ✅ 해결: "전문적 데이터 시각화"로 컨셉 전환
- **전략**: 어설픈 인간 모방 대신, **"AI가 인식한 정교한 데이터"**라는 컨셉 강조.
- **구현**:
  - **Holographic Style**: 아주 얇은 와이어프레임과 발광(Emissive) 소재 사용.
  - **3가지 테마**:
    1. **Basic**: 깔끔한 실버 (Apple 스타일)
    2. **Professional**: 사이버네틱 네온 (Iron Man UI 스타일)
    3. **Cute**: 파스텔 톤 (부드러운 카툰 스타일)
  - **결과**: "징그러움"을 "첨단 기술의 느낌"으로 승화.

---

## 다음 단계

### 단기 (이번 주)
- [x] 3D 아바타 뷰어 안정화 (완료)
- [ ] 실제 수어 데이터와 아바타 연동 (Data Fetching)
- [ ] 데이터 수집 (500+ 샘플) ML 모델 고도화

### 중기 (다음 주)
- [ ] 프론트엔드 UI/UX 폴리싱
- [ ] 커뮤니티 기능 구현 (사용자 수어 공유)

### 장기 (1개월+)
- [ ] AWS 배포 (S3 + EC2/Vercel)
- [ ] 50+ 수어 사전 데이터베이스 구축
- [ ] 모바일 앱 (PWA) 최적화

---

## 참고 자료

### 논문/연구
1. Korean Sign Language Recognition Using LSTM (KSL Dataset)
2. MediaPipe Hands: Real-time Hand Tracking
3. Transformer-based Sign Language Recognition

### GitHub 참고
- Hugging Face: ASL Recognition Models
- TensorFlow: Sign Language Examples

---

**마지막 업데이트**: 2026-01-08  
**작성자**: [프로젝트 팀]
