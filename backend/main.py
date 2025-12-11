from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정 (Next.js인 localhost:3000 에서 오는 요청을 허용)
origins = [
    "http://localhost:3000",
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
    return {
        "words": [
            {
                "id": 1,
                "word": "안녕하세요",
                "description": "만남의 기본 인사",
                "category": "일상",
                "thumbnailUrl": "/sign-language-hello.jpg",
                # [수정됨] 국립국어원 영상 (크롤링 데이터 적용)
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/09/25/2020092518593498877.mp4",
                "difficulty": "초급",
                "key_point": "두 주먹을 가슴 앞에서 아래로 공손하게 내리세요.",
                "context": "어른이나 친구를 만났을 때 사용합니다.",
                "related_words": ["반갑습니다", "오랜만입니다"]
            },
            {
                "id": 2,
                "word": "감사합니다",
                "description": "고마움을 표현하는 수화",
                "category": "일상",
                "thumbnailUrl": "/sign-language-thank-you.png",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/09/25/2020092519014526644.mp4",
                "difficulty": "초급",
                "key_point": "왼손 등을 오른손 날로 두 번 가볍게 두드립니니다.",
                "context": "선물을 받거나 도움을 받았을 때 사용해요.",
                "related_words": ["고마워", "천만에요"]
            },
            {
                "id": 3,
                "word": "사랑해요",
                "description": "사랑을 전하는 수화",
                "category": "감정",
                "thumbnailUrl": "/sign-language-love.jpg",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/08/21/2020082116035178788.mp4",
                "difficulty": "초급",
                "key_point": "왼손 주먹 위에 오른손바닥을 대고 둥글게 돌려줍니다.",
                "context": "가족, 연인에게 마음을 표현할 때 써보세요.",
                "related_words": ["좋아해요", "행복해요"]
            },
            {
                "id": 4,
                "word": "도와주세요",
                "description": "도움을 요청하는 수화",
                "category": "일상",
                "thumbnailUrl": "/sign-language-help.png",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/09/25/2020092518552178229.mp4",
                "difficulty": "중급",
                "key_point": "왼손바닥 위에 오른손 주먹(엄지 세움)을 올려 돕는 모양을 만듭니다.",
                "context": "긴급한 상황이나 부탁이 있을 때 사용합니다.",
                "related_words": ["살려주세요", "부탁합니다"]
            },
            {
                "id": 5,
                "word": "친구",
                "description": "친밀한 관계를 표현",
                "category": "관계",
                "thumbnailUrl": "/sign-language-friend.jpg",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/08/21/2020082116062634354.mp4",
                "difficulty": "초급",
                "key_point": "두 손으로 악수하듯이 서로 맞잡아 흔듭니다.",
                "context": "친한 사이임을 소개할 때 씁니다.",
                "related_words": ["우정", "단짝"]
            },
            {
                "id": 6,
                "word": "가족",
                "description": "한 집에 사는 식구",
                "category": "관계",
                "thumbnailUrl": "/family-sign-language.jpg",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/08/21/2020082116084358897.mp4",
                "difficulty": "초급",
                "key_point": "두 손을 펴서 지붕 모양을 만들었다가 동그랗게 모읍니다.",
                "context": "우리 집 식구들을 소개할 때 사용해요.",
                "related_words": ["집", "부모님"]
            },
            {
                "id": 7,
                "word": "학교",
                "description": "배움의 장소",
                "category": "장소",
                "thumbnailUrl": "/school-sign-language.jpg",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/08/21/2020082116110967008.mp4",
                "difficulty": "초급",
                "key_point": "책을 펴서 읽는 동작 후 집(지붕) 모양을 만듭니다.",
                "context": "학생들이 공부하러 가는 곳입니다.",
                "related_words": ["선생님", "공부"]
            },
            {
                "id": 8,
                "word": "병원",
                "description": "아플 때 가는 곳",
                "category": "장소",
                "thumbnailUrl": "/hospital-sign-language.jpg",
                "videoUrl": "https://sldict.korean.go.kr/multimedia/2020/08/21/2020082116135894334.mp4",
                "difficulty": "중급",
                "key_point": "손목의 맥박을 짚는 시늉을 한 뒤 집 모양을 만듭니다.",
                "context": "몸이 아파서 치료가 필요할 때 가는 곳입니다.",
                "related_words": ["의사", "약국"]
            }
        ]
    }