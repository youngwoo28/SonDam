# backend/extract_video_landmarks.py
"""
Extract real hand landmarks from video files using MediaPipe.
The script scans `public/videos/**/*.mp4`, processes each video at up to 30 fps,
and saves a JSON file per video under `data/landmarks/` with the same structure
as the previous dummy version (list of frames, each containing `hand` id and
`landmarks` array of 21 points `[x, y, z]`).
"""

import json
import cv2
import mediapipe as mp
# from mediapipe.python.solutions import hands as mp_hands (Removed)
from pathlib import Path
from tqdm import tqdm

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
VIDEO_ROOT = Path(__file__).parents[1] / "public" / "videos"
OUTPUT_ROOT = Path(__file__).parents[1] / "data" / "landmarks"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

TARGET_FPS = 30          # Max frames per second to sample from the video
NUM_HANDS = 2            # Simulate left/right hand (MediaPipe can detect up to 2)

# Initialise MediaPipe Hands (will be set in main)
hands = None

def extract_hand_landmarks(frame) -> list:
    """Run MediaPipe Hands on a single RGB frame and return a list of 21
    `[x, y, z]` coordinates (normalized to [0, 1]). If no hand is detected,
    returns an empty list.
    """
    results = hands.process(frame)
    if not results.multi_hand_landmarks:
        return []
    # Use the first detected hand (or iterate if needed)
    hand_landmarks = results.multi_hand_landmarks[0]
    return [[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]

def process_video(video_path: Path) -> dict:
    """Extract hand landmarks from a video file.
    The function samples up to `TARGET_FPS` frames evenly across the video
    duration, runs MediaPipe Hands on each frame, and records landmarks for up
    to `NUM_HANDS` (left/right) if detected.
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS) or TARGET_FPS
    frame_interval = max(int(video_fps / TARGET_FPS), 1)

    frames = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % frame_interval == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            landmarks = extract_hand_landmarks(rgb)
            if landmarks:
                # Assume a single hand; hand id 0
                frames.append({"hand": 0, "landmarks": landmarks})
        idx += 1
    cap.release()

    return {
        "video": str(video_path.relative_to(Path.cwd())),
        "fps": TARGET_FPS,
        "frames": frames,
    }

def main() -> None:
    global hands
    # Initialise MediaPipe Hands once
    hands = mp.solutions.hands.Hands(
        static_image_mode=False,
        max_num_hands=NUM_HANDS,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    video_files = list(VIDEO_ROOT.rglob("*.mp4"))
    if not video_files:
        print("⚠️ No .mp4 files found under", VIDEO_ROOT)
        return

    for video_path in tqdm(video_files, desc="Extracting MediaPipe landmarks"):
        data = process_video(video_path)
        out_path = OUTPUT_ROOT / f"{video_path.stem}_landmarks.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n✅ MediaPipe landmark extraction finished. Files saved to:", OUTPUT_ROOT)

if __name__ == "__main__":
    main()
