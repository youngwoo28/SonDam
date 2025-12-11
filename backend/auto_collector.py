import os
import json
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# ==========================================
# 1. 대상 데이터 (국립국어원 ID)
# ==========================================
TARGET_MAP = [
    {"id_code": "11686", "word": "안녕하세요", "cat": "일상", "desc": "만남의 기본 인사", "ctx": "어른이나 친구를 만났을 때 사용합니다.", "rel": ["반갑습니다"]},
    {"id_code": "6241",  "word": "고맙습니다", "cat": "일상", "desc": "고마움을 표현하는 수화", "ctx": "도움을 받았을 때 사용해요.", "rel": ["감사합니다"]},
    {"id_code": "3636",  "word": "사랑", "cat": "감정", "desc": "사랑을 전하는 수화", "ctx": "가족, 연인에게 마음을 표현할 때.", "rel": ["좋아해요"]},
    {"id_code": "2272",  "word": "돕다", "alias": "도와주세요", "cat": "일상", "desc": "도움을 요청하는 수화", "ctx": "긴급한 상황이나 부탁이 있을 때.", "rel": ["살려주세요"]},
    {"id_code": "11002", "word": "친구", "cat": "관계", "desc": "친밀한 관계를 표현", "ctx": "친한 사이임을 소개할 때.", "rel": ["우정"]},
    {"id_code": "101",   "word": "가족", "cat": "관계", "desc": "한 집에 사는 식구", "ctx": "우리 집 식구들을 소개할 때.", "rel": ["집", "부모님"]},
    {"id_code": "11283", "word": "학교", "cat": "장소", "desc": "배움의 장소", "ctx": "공부하러 가는 곳입니다.", "rel": ["선생님"]},
    {"id_code": "4544",  "word": "병원", "cat": "장소", "desc": "아플 때 가는 곳", "ctx": "치료가 필요할 때 갑니다.", "rel": ["의사", "약국"]}
]

# ==========================================
# 2. 설정 및 폴더 생성
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, "../public/videos")
THUMB_DIR = os.path.join(BASE_DIR, "../public/thumbnails")

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

# ==========================================
# 3. 셀레니움 브라우저 설정 (사용자 경로 반영)
# ==========================================
print("🔧 브라우저 세팅 중... (경로: 내가 다운로드 한 거/Google Chrome.app)")

chrome_options = Options()

# [핵심 수정] 사용자가 알려준 경로로 정확히 지정
chrome_options.binary_location = "/Applications/내가 다운로드 한 거/Google Chrome.app/Contents/MacOS/Google Chrome"

# Headless 모드 (오류 방지를 위해 일단 끄고 창이 뜨는 걸 눈으로 확인하세요)
# chrome_options.add_argument("--headless") 
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
except Exception as e:
    print("\n❌ 브라우저 실행 실패!")
    print(f"에러 메시지: {e}")
    exit()

def download_content(url, save_path):
    try:
        if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
            return True
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Referer": "https://sldict.korean.go.kr/"
        }
        
        # verify=False로 SSL 에러 무시
        with requests.get(url, headers=headers, stream=True, verify=False, timeout=30) as r:
            if r.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=1024*1024):
                        f.write(chunk)
                return True
        return False
    except Exception as e:
        print(f"      ❌ 다운로드 에러: {e}")
        return False

# ==========================================
# 4. 메인 실행 루프
# ==========================================
final_data = []

print(f"🚀 [Selenium 모드] 다운로드 시작... (저장: {VIDEO_DIR})\n")

try:
    for idx, item in enumerate(TARGET_MAP, 1):
        display_word = item.get("alias", item["word"])
        origin_no = item["id_code"]
        
        target_url = f"https://sldict.korean.go.kr/front/sign/signContentsView.do?origin_no={origin_no}"
        
        print(f"[{idx}/8] 📥 '{display_word}' 페이지 접속 중...")
        driver.get(target_url)
        time.sleep(2) # 로딩 대기
        
        video_url = None
        
        # 1. hidden input 찾기
        try:
            input_tag = driver.find_element(By.ID, "previewFileName")
            video_url = input_tag.get_attribute("value")
        except:
            pass

        # 2. video 태그 찾기
        if not video_url:
            try:
                video_tag = driver.find_element(By.TAG_NAME, "video")
                video_url = video_tag.get_attribute("src")
            except:
                pass

        if video_url:
            if not video_url.startswith("http"):
                 video_url = "https://sldict.korean.go.kr" + video_url

            print(f"      🎯 주소 확보: {video_url[:40]}...")
            
            filename_base = f"{idx}_{display_word}"
            video_path = os.path.join(VIDEO_DIR, f"{filename_base}.mp4")
            thumb_path = os.path.join(THUMB_DIR, f"{filename_base}.jpg")
            
            if download_content(video_url, video_path):
                print("      ✅ 영상 저장 성공")
            else:
                print("      ❌ 영상 저장 실패")

            thumb_url = video_url.replace(".mp4", "_size_l.jpg")
            if download_content(thumb_url, thumb_path):
                 print("      ✅ 썸네일 저장 성공")
            else:
                 print("      ⚠️ 썸네일 없음")
                 
            final_data.append({
                "id": idx,
                "word": display_word,
                "description": item['desc'],
                "category": item['cat'],
                "thumbnailUrl": f"/thumbnails/{filename_base}.jpg",
                "videoUrl": f"/videos/{filename_base}.mp4",
                "difficulty": "초급",
                "key_point": "국립국어원 표준 수어",
                "context": item['ctx'],
                "related_words": item['rel']
            })
        else:
            print(f"      ❌ 영상을 못 찾았습니다.")

finally:
    driver.quit()

print("\n" + "="*60)
print("✅ 작업 완료! 아래 JSON을 backend/main.py에 복사하세요.")
print("="*60)

print(json.dumps({"words": final_data}, indent=4, ensure_ascii=False))