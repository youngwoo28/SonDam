"""
Generate training dataset from real MediaPipe landmarks.
Reads extracted landmarks from `data/landmarks/`, applies data augmentation,
and saves a consolidated JSON file to `collected_data/` for training.
"""

import json
import numpy as np
import re
from pathlib import Path
from typing import List, Dict, Any

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
LANDMARK_DIR = Path(__file__).parents[1] / "data" / "landmarks"
OUTPUT_DIR = Path(__file__).parents[1] / "collected_data"
OUTPUT_FILE = OUTPUT_DIR / "training_dataset.json"

TARGET_SAMPLES = 50  # Target number of samples per sign (real + augmented)

# Mapping from filename parts to canonical labels
LABEL_MAP = {
    "안녕하세요": "안녕",
    "안녕": "안녕",
    "감사합니다": "감사",
    "감사": "감사",
    "사랑": "사랑",
    "도움": "도움",
    "돕다": "도움",
    "괜찮다": "괜찮다",
    "미안": "미안",
    "죄송": "미안",
    "좋다": "좋다",
    "나쁘다": "나쁘다",
    "배고프다": "배고프다",
    "학생": "학생",
    "친구": "친구",
    "가족": "가족",
    "학교": "학교",
    "병원": "병원",
    "맛있다": "맛있다",
    "행복": "행복",
    "슬프다": "슬프다",
    "화나다": "화나다",
    "공부": "공부",
    "무섭다": "무섭다",
    "선생님": "선생님",
    "심심하다": "심심하다",
    "아프다": "아프다",
    "약국": "약국",
    "일하다": "일하다",
    "조심": "조심",
    "회사": "회사",
    "회의": "회의"
}

class RealSignDataGenerator:
    def __init__(self):
        self.samples = []
    
    def normalize_label(self, filename: str) -> str:
        """Extract and normalize label from filename."""
        # Remove extension and path
        name = Path(filename).stem
        # Remove _landmarks suffix
        name = name.replace("_landmarks", "")
        # Remove leading numbers and underscores (e.g., "1_사랑" -> "사랑")
        name = re.sub(r'^\d+_', '', name)
        
        # Map to canonical label
        return LABEL_MAP.get(name, name)

    def load_real_landmarks(self):
        """Load landmark JSON files from data/landmarks/."""
        if not LANDMARK_DIR.exists():
            print(f"⚠️ Landmark directory not found: {LANDMARK_DIR}")
            return

        files = list(LANDMARK_DIR.glob("*.json"))
        print(f"Loading {len(files)} landmark files from {LANDMARK_DIR}...")

        loaded_count = 0
        for p in files:
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                label = self.normalize_label(p.name)
                frames = data.get("frames", [])
                
                # Extract sequences (list of [x,y,z] points) from frames
                # Handling multiple hands: currently taking the first hand detected in each frame
                # Ideally we should track hands, but this is a simplified version matching extract_video_landmarks logic
                sequence = []
                for frame in frames:
                    # frames is a list of dicts: { "hand": 0, "landmarks": [[x,y,z], ...] }
                    # extract_video_landmarks output structure: "frames": [{"hand":..., "landmarks":...}, ...]
                    # Actually process_video puts ONE hand per frame dict in the list?
                    # Let's check the structure. The list 'frames' simply appends logic.
                    lm = frame.get("landmarks", [])
                    if lm:
                        sequence.append(lm)
                
                if not sequence:
                    continue

                self.samples.append({
                    "sign": label,
                    "sequence": sequence,
                    "recorder": "mediapipe_extraction",
                    "source": p.name
                })
                loaded_count += 1
            except Exception as e:
                print(f"❌ Error loading {p.name}: {e}")
        
        print(f"Successfully loaded {loaded_count} base samples.")

    def augment_sequence(self, sequence: List[List[float]]) -> List[List[float]]:
        """Apply random noise and scaling to a landmark sequence."""
        seq_np = np.array(sequence) # (T, 21, 3)
        
        # 1. Random Scaling (0.9 ~ 1.1)
        scale = np.random.uniform(0.9, 1.1)
        # Scale around center (0.5, 0.5) roughly
        center = np.array([0.5, 0.5, 0.0])
        seq_aug = (seq_np - center) * scale + center
        
        # 2. Random Noise (jitter)
        noise = np.random.normal(0, 0.005, seq_aug.shape) # 0.5% jitter
        seq_aug += noise
        
        return seq_aug.tolist()

    def generate_augmented_dataset(self):
        """Augment data to reach TARGET_SAMPLES per sign."""
        # Group by sign
        grouped = {}
        for s in self.samples:
            label = s["sign"]
            if label not in grouped:
                grouped[label] = []
            grouped[label].append(s)
        
        final_dataset = []
        
        print(f"\nAugmenting data to {TARGET_SAMPLES} samples per sign...")
        
        for label, items in grouped.items():
            # Add real samples
            final_dataset.extend(items)
            current_count = len(items)
            
            # Augment
            needed = max(0, TARGET_SAMPLES - current_count)
            print(f"  {label}: {current_count} real -> generating {needed} augmented")
            
            if current_count == 0:
                continue
                
            for i in range(needed):
                # Pick a random real sample to augment
                base = np.random.choice(items)
                aug_seq = self.augment_sequence(base["sequence"])
                
                final_dataset.append({
                    "sign": label,
                    "sequence": aug_seq,
                    "recorder": "augmented",
                    "source": base["source"]
                })
        
        return final_dataset

    def save_dataset(self, dataset):
        """Save the dataset to JSON."""
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Remove old synthetic data if it exists to avoid mixing
        synthetic_path = OUTPUT_DIR / "synthetic_data.json"
        if synthetic_path.exists():
            print(f"Removing old synthetic data: {synthetic_path}")
            synthetic_path.unlink()
            
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
            
        print(f"\n✅ Saved {len(dataset)} training samples to {OUTPUT_FILE}")
        
        # Print stats
        from collections import Counter
        counts = Counter(d['sign'] for d in dataset)
        print("\nFinal Class Distribution:")
        for k, v in counts.items():
            print(f"  {k}: {v}")

def main():
    generator = RealSignDataGenerator()
    generator.load_real_landmarks()
    
    if not generator.samples:
        print("❌ No real landmarks found. Please run extract_video_landmarks.py first.")
        return

    dataset = generator.generate_augmented_dataset()
    generator.save_dataset(dataset)

if __name__ == "__main__":
    main()
