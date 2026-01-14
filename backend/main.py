from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sign_recognizer import SignLanguageRecognizer
from pathlib import Path
from datetime import datetime
import json
import os


app = FastAPI()

# public 폴더를 /videos 경로로 마운트 (정적 파일 서빙)
# 실제 경로는 ../public (backend 기준 상위 폴더의 public)
app.mount("/videos", StaticFiles(directory="../public/videos"), name="videos")
app.mount("/thumbnails", StaticFiles(directory="../public/thumbnails"), name="thumbnails")
app.mount("/static", StaticFiles(directory="static"), name="static")


# CORS 설정 (Next.js인 localhost:3000 에서 오는 요청을 허용)
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "손담 백엔드 서버 실행 중"}

@app.get("/api/dictionary")
def get_dictionary():
    
    # 1. Try Loading S3 Data
    s3_data_path = "data/dictionary_s3.json"
    if os.path.exists(s3_data_path):
        try:
            with open(s3_data_path, "r", encoding="utf-8") as f:
                s3_data = json.load(f)
            
            # Format transformation (if needed) to match frontend expectation
            # Frontend expects: id, word, description, category, thumbnailUrl, videoUrl, difficulty
            # S3 data has: word, category, description, videoUrl, thumbnailUrl, difficulty
            
            response_data = []
            for idx, item in enumerate(s3_data):
                response_data.append({
                    "id": idx + 1,
                    "word": item["word"],
                    "description": item["description"],
                    "category": item["category"],
                    "thumbnailUrl": item["thumbnailUrl"],
                    "videoUrl": item["videoUrl"],
                    "difficulty": item["difficulty"],
                    "key_point": item.get("key_point", f"{item['word']} 수어 동작입니다."),
                    "context": item.get("context", "일상 생활에서 자주 사용됩니다."),
                    "related_words": item.get("related_words", [])
                })
            
            return {"words": response_data}
        except Exception as e:
            print(f"Error loading S3 data: {e}")
            # Fallback to default if error
            pass

    # 2. Default Hardcoded Data (Fallback)
    return {
        "words": [
            {
                "id": 1,
                "word": "안녕하세요",
                "description": "만남의 기본 인사",
                "category": "일상",
                "thumbnailUrl": "/thumbnails/sign-language-hello.png",
                "videoUrl": "http://localhost:8000/videos/1_안녕하세요.mp4",
                "difficulty": "초급",
                "key_point": "두 주먹을 가슴 앞에서 아래로 공손하게 내리세요.",
                "context": "어른이나 친구를 만났을 때 사용합니다.",
                "related_words": ["반갑습니다", "오랜만입니다"]
            },
            # ... (Keep one or two samples as fallback) ...
             {
                "id": 2,
                "word": "감사합니다",
                "description": "고마움을 표현하는 수화",
                "category": "일상",
                "thumbnailUrl": "/sign-language-thank-you.png",
                "videoUrl": "http://localhost:8000/videos/2_감사합니다.mp4",
                "difficulty": "초급",
                "key_point": "왼손 등을 오른손 날로 두 번 가볍게 두드립니니다.",
                "context": "선물을 받거나 도움을 받았을 때 사용해요.",
                "related_words": ["고마워", "천만에요"]
            }
        ]
    }



# ===== Sign Language Recognition API =====
# Initialize recognizer
recognizer = SignLanguageRecognizer()

class RecognitionRequest(BaseModel):
    landmarks: List[List[List[float]]]  # Sequence of frames: 30 frames × 21 landmarks × [x, y, z]

class ContributionRequest(BaseModel):
    """사용자 기여 데이터"""
    sign: str
    landmarks: List[dict]  # 프레임별 랜드마크 데이터
    contributor_id: Optional[str] = None

@app.post("/api/recognize")
async def recognize_sign(request: RecognitionRequest):
    """
    Recognize sign language from MediaPipe hand landmarks sequence
    
    Expected input format:
    {
        "landmarks": [
            # Frame 1
            [
                [x1, y1, z1],  # Landmark 0 (wrist)
                ...
                [x21, y21, z21] # Landmark 20 (pinky tip)
            ],
            # ... Frame 30
        ]
    }
    
    Returns:
    {
        "sign": "안녕",
        "confidence": 0.92,
        "method": "ml_model"
    }
    """
    try:
        sign, confidence = recognizer.recognize_from_landmarks(
            request.landmarks
        )
        
        return {
            "sign": sign,
            "confidence": float(confidence),
            "method": "rule_based" if recognizer.use_rules else "ml_model"
        }
    except Exception as e:
        print(f"Recognition error: {e}")
        return {
            "sign": "오류",
            "confidence": 0.0,
            "error": str(e)
        }
@app.post("/api/contribute")
async def contribute_data(request: ContributionRequest):
    """
    사용자가 기여한 수어 데이터 저장
    """
    try:
        if not request.landmarks or len(request.landmarks) == 0:
            raise HTTPException(status_code=400, detail="No landmarks provided")
        
        # timestamp 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # 파일명 생성
        filename = f"contribution_{timestamp}_{request.sign}.json"
        
        # collected_data/contributions/ 폴더에 저장
        save_dir = Path("collected_data/contributions")
        save_dir.mkdir(parents=True, exist_ok=True)
        save_path = save_dir / filename
        
        # 데이터 저장
        contribution_data = {
            "sign": request.sign,
            "sequence": request.landmarks,
            "contributor": request.contributor_id or "anonymous",
            "timestamp": datetime.now().isoformat(),
            "frames": len(request.landmarks)
        }
        
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump([contribution_data], f, ensure_ascii=False, indent=2)
        
        return {
            "success": True,
            "message": "감사합니다! 데이터가 저장되었습니다.",
            "contribution_id": timestamp
        }
    except Exception as e:
        print(f"Contribution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
