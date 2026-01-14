#!/usr/bin/env python3
"""
국립국어원 한국수어사전에서 수어 영상 다운로드
"""

import requests
from bs4 import BeautifulSoup
import os
from pathlib import Path
import time

# 다운로드할 수어 단어 리스트
WORDS = [
    "안녕", "감사", "사랑", "미안", "괜찮다",
    "도움", "좋다", "나쁘다", "배고프다", "학생",
    "친구", "가족", "학교", "병원", "맛있다",
    "행복", "슬프다", "화나다"
]

# 국립국어원 한국수어사전 URL
BASE_URL = "https://sldict.korean.go.kr"
SEARCH_URL = f"{BASE_URL}/front/sign/signList.do"

def download_sign_video(word: str, output_dir: Path):
    """
    특정 단어의 수어 영상을 다운로드
    """
    print(f"\n{'='*50}")
    print(f"📥 '{word}' 검색 중...")
    print(f"{'='*50}")
    
    try:
        # 1. 검색 페이지 접속
        search_params = {
            'pageIndex': '1',
            'searchWrd': word,
            'sort': 'poplrCo'
        }
        
        response = requests.get(SEARCH_URL, params=search_params)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 2. 첫 번째 검색 결과의 영상 링크 찾기
        video_links = soup.find_all('video')
        
        if not video_links:
            print(f"❌ '{word}' 영상을 찾을 수 없습니다.")
            return False
        
        # 3. 영상 URL 추출
        video_url = video_links[0].get('src')
        if not video_url:
            video_url = video_links[0].find('source').get('src')
        
        if not video_url.startswith('http'):
            video_url = BASE_URL + video_url
        
        print(f"🔗 영상 URL: {video_url}")
        
        # 4. 영상 다운로드
        print(f"⏬ 다운로드 중...")
        video_response = requests.get(video_url, stream=True)
        
        output_file = output_dir / f"{word}.mp4"
        
        with open(output_file, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        file_size = output_file.stat().st_size / 1024  # KB
        print(f"✅ 다운로드 완료: {output_file} ({file_size:.1f} KB)")
        
        return True
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return False

def main():
    """메인 함수"""
    print("=" * 60)
    print("국립국어원 한국수어사전 영상 다운로드")
    print("=" * 60)
    print()
    
    # 출력 디렉토리 생성
    output_dir = Path("../public/videos")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 저장 경로: {output_dir.absolute()}")
    print(f"📝 다운로드할 단어: {len(WORDS)}개")
    print()
    
    # 각 단어의 영상 다운로드
    success_count = 0
    fail_list = []
    
    for i, word in enumerate(WORDS, 1):
        print(f"\n[{i}/{len(WORDS)}] 진행률: {i/len(WORDS)*100:.1f}%")
        
        if download_sign_video(word, output_dir):
            success_count += 1
        else:
            fail_list.append(word)
        
        # API 부하 방지를 위한 대기
        if i < len(WORDS):
            time.sleep(2)  # 2초 대기
    
    # 결과 요약
    print("\n" + "=" * 60)
    print("다운로드 완료!")
    print("=" * 60)
    print(f"\n✅ 성공: {success_count}/{len(WORDS)}")
    
    if fail_list:
        print(f"\n❌ 실패한 단어:")
        for word in fail_list:
            print(f"  - {word}")
    
    print(f"\n📁 저장 위치: {output_dir.absolute()}")
    print("\n다음 단계:")
    print("  1. 다운로드된 영상 확인")
    print("  2. AWS S3에 업로드: ./upload_videos_to_s3.sh")

if __name__ == "__main__":
    main()
