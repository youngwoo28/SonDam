"""
Sign Language Recognition Service
Supports both rule-based and ML-based recognition
"""

import numpy as np
from typing import List, Tuple, Optional
import json


class SignLanguageRecognizer:
    """
    Recognizes Korean Sign Language from MediaPipe hand landmarks
    """
    
    def __init__(self):
        self.signs_vocab = {
            0: "안녕",
            1: "감사",
            2: "사랑",
            3: "도움",
            4: "괜찮다",
            5: "미안",
            6: "좋다",
            7: "나쁘다",
            8: "배고프다",
            9: "학생"
        }
        
        # Try to load ML model
        self.model = self.load_ml_model()
        self.use_rules = (self.model is None)  # Use rules if ML model fails to load
        
    def load_ml_model(self):
        """Load trained ML model"""
        try:
            from lstm_model import SignLanguageLSTM
            from pathlib import Path
            
            model_path = Path("models/korean_sign_lstm.h5")
            label_map_path = Path("models/label_map.json")
            
            if not model_path.exists() or not label_map_path.exists():
                print("ML model not found, using rules")
                return None
            
            model = SignLanguageLSTM()
            model.load(str(model_path), str(label_map_path))
            print("✅ ML model loaded successfully!")
            return model
            
        except Exception as e:
            print(f"Failed to load ML model: {e}")
            print("Falling back to rule-based recognition")
            return None
        
    def recognize_from_landmarks(
        self, 
        landmarks: List[List[float]]
    ) -> Tuple[str, float]:
        """
        Recognize sign from MediaPipe landmarks
        
        Args:
            landmarks: List of [x, y, z] coordinates for 21 hand landmarks
            
        Returns:
            (recognized_sign, confidence_score)
        """
        
        if self.use_rules:
            return self.rule_based_recognition(landmarks)
        else:
            return self.ml_recognition(landmarks)
    
    def rule_based_recognition(
        self, 
        landmarks: List[List[float]]
    ) -> Tuple[str, float]:
        """
        Simple geometric rules for common Korean signs
        """
        
        if not landmarks or len(landmarks) < 21:
            return "미확인", 0.0
        
        # Convert to numpy for easier computation
        points = np.array(landmarks)
        
        # Extract features
        fingers_extended = self._count_extended_fingers(points)
        hand_orientation = self._get_hand_orientation(points)
        hand_position = self._get_hand_position(points)
        
        # Pattern matching rules (ORDER MATTERS!)
        
        # Check thumbs-up first (before counting fingers)
        if self._is_thumbs_up(points):
            return "괜찮다", 0.88
        
        # Rule 1: 안녕 (Hello) - Open palm facing forward
        if fingers_extended == 5 and hand_orientation == "front":
            return "안녕", 0.92
        
        # Rule 2: 감사 (Thank you) - Closed fist
        if fingers_extended == 0:
            return "감사", 0.90
        
        # Rule 3: 사랑 (Love) - Peace sign (index + middle finger)
        if fingers_extended == 2 and self._is_peace_sign(points):
            return "사랑", 0.87
        
        # Rule 4: 도움 (Help) - One finger pointing
        if fingers_extended == 1 and not self._is_thumbs_up(points):
            return "도움", 0.82
        
        # Rule 5: 미안 (Sorry) - Hand near forehead (high position)
        if hand_position == "high" and fingers_extended >= 4:
            return "미안", 0.75
        
        # Rule 6: 좋다 (Good) - Similar to thumbs up
        # (Skip for now, too similar to 괜찮다)
        
        # Default: uncertain
        return "미확인", 0.5
    
    def _count_extended_fingers(self, landmarks: np.ndarray) -> int:
        """
        Count how many fingers are extended
        
        Finger tip indices:
        - Thumb: 4
        - Index: 8
        - Middle: 12
        - Ring: 16
        - Pinky: 20
        """
        
        finger_tips = [4, 8, 12, 16, 20]
        finger_pips = [3, 6, 10, 14, 18]  # PIP joints (middle joints)
        
        count = 0
        
        # Special handling for thumb (horizontal movement)
        thumb_tip = landmarks[4]
        thumb_ip = landmarks[3]
        thumb_mcp = landmarks[2]
        
        # Thumb is extended if tip is farther from palm than MCP
        if np.linalg.norm(thumb_tip[:2] - landmarks[0][:2]) > \
           np.linalg.norm(thumb_mcp[:2] - landmarks[0][:2]):
            count += 1
        
        # Other fingers: extended if tip is higher (lower y) than PIP
        for tip_idx, pip_idx in zip(finger_tips[1:], finger_pips[1:]):
            if landmarks[tip_idx][1] < landmarks[pip_idx][1]:
                count += 1
        
        return count
    
    def _is_peace_sign(self, landmarks: np.ndarray) -> bool:
        """
        Check if gesture is peace sign (index + middle up, others down)
        """
        # Index and middle finger extended
        index_up = landmarks[8][1] < landmarks[6][1]
        middle_up = landmarks[12][1] < landmarks[10][1]
        
        # Ring and pinky folded
        ring_down = landmarks[16][1] > landmarks[14][1]
        pinky_down = landmarks[20][1] > landmarks[18][1]
        
        return index_up and middle_up and ring_down and pinky_down
    
    def _is_thumbs_up(self, landmarks: np.ndarray) -> bool:
        """
        Check if gesture is thumbs up
        """
        # Thumb extended upward
        thumb_tip = landmarks[4]
        thumb_mcp = landmarks[2]
        wrist = landmarks[0]
        
        # Thumb pointing up (tip y < mcp y)
        thumb_up = thumb_tip[1] < thumb_mcp[1]
        
        # Other fingers curled (tips lower than base)
        fingers_curled = all(
            landmarks[tip][1] > landmarks[base][1]
            for tip, base in [(8, 6), (12, 10), (16, 14), (20, 18)]
        )
        
        return thumb_up and fingers_curled
    
    def _get_hand_orientation(self, landmarks: np.ndarray) -> str:
        """
        Determine if palm is facing front, side, or down
        """
        # Calculate normal vector of palm plane
        wrist = landmarks[0]
        index_mcp = landmarks[5]
        pinky_mcp = landmarks[17]
        
        # Vector from wrist to index MCP
        v1 = index_mcp - wrist
        # Vector from wrist to pinky MCP
        v2 = pinky_mcp - wrist
        
        # Cross product gives normal to palm
        normal = np.cross(v1, v2)
        
        # Check z component
        if abs(normal[2]) > 0.5:
            return "front"
        elif abs(normal[0]) > 0.5:
            return "side"
        else:
            return "down"
    
    def _get_hand_position(self, landmarks: np.ndarray) -> str:
        """
        Determine if hand is at high, middle, or low position
        """
        wrist_y = landmarks[0][1]
        
        if wrist_y < 0.3:
            return "high"
        elif wrist_y < 0.6:
            return "middle"
        else:
            return "low"
    
    def ml_recognition(
        self, 
        landmarks: List[List[List[float]]]
    ) -> Tuple[str, float]:
        """
        ML-based recognition using trained LSTM model
        """
        if self.model is None:
            return "모델 로딩중", 0.0
        
        try:
            # Input is already a sequence: (30, 21, 3)
            # Convert to numpy array
            sequence = np.array(landmarks)
            
            # Ensure shape is correct (30, 21, 3)
            if sequence.shape != (30, 21, 3):
                print(f"[WARNING] Incorrect sequence shape: {sequence.shape}")
                # If we got a single frame by mistake (21, 3), try to tile it
                if sequence.shape == (21, 3):
                    sequence = np.tile(sequence, (30, 1, 1))
                else:
                    return "입력오류", 0.0
            
            # Use trained model to predict
            # Predict expects (batch_size, time_steps, features) or (time_steps, features) depending on implementation
            # LSTM model predict method likely handles single sample (30, 21, 3) by adding batch dim
            sign, confidence = self.model.predict(sequence)
            
            print(f"[DEBUG] Predicted: {sign} ({confidence:.2f})")
            
            # If confidence is too low, return unknown
            if confidence < 0.5:
                return "미확인", confidence
            
            return sign, confidence
        except Exception as e:
            print(f"ML prediction error: {e}")
            import traceback
            traceback.print_exc()
            # Failsafe: Try to use rules on the last frame
            if landmarks and len(landmarks) > 0:
                last_frame = landmarks[-1]
                return self.rule_based_recognition(last_frame)
            return "오류", 0.0
    
    def switch_to_ml_mode(self):
        """Switch from rule-based to ML-based recognition"""
        if self.model is not None:
            self.use_rules = False
            print("Switched to ML mode")
        else:
            print("ML model not available, staying in rule mode")
    
    def switch_to_rule_mode(self):
        """Switch from ML-based to rule-based recognition"""
        self.use_rules = True
        print("Switched to rule mode")
