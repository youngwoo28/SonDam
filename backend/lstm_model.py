"""
LSTM Model for Korean Sign Language Recognition
"""

import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
import matplotlib.pyplot as plt


class SignLanguageLSTM:
    """LSTM model for sign language recognition"""
    
    def __init__(self, num_classes=10, sequence_length=30):
        self.sequence_length = sequence_length
        self.num_features = 63  # 21 landmarks × 3 coords (x, y, z)
        self.num_classes = num_classes
        self.model = None
        self.label_map = {}
        
    def build_model(self):
        """Build LSTM architecture"""
        model = models.Sequential([
            # Input layer: (batch, 30 frames, 63 features)
            layers.Input(shape=(self.sequence_length, self.num_features)),
            
            # LSTM layers with dropout
            layers.LSTM(128, return_sequences=True, name='lstm_1'),
            layers.Dropout(0.3),
            
            layers.LSTM(64, return_sequences=True, name='lstm_2'),
            layers.Dropout(0.3),
            
            layers.LSTM(32, return_sequences=False, name='lstm_3'),
            layers.Dropout(0.2),
            
            # Dense layers
            layers.Dense(64, activation='relu', name='dense_1'),
            layers.Dropout(0.2),
            
            layers.Dense(self.num_classes, activation='softmax', name='output')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def load_collected_data(self, data_dir="collected_data"):
        """Load all collected JSON files"""
        all_sequences = []
        all_labels = []
        
        label_map = {}
        current_idx = 0
        
        data_path = Path(data_dir)
        if not data_path.exists():
            raise ValueError(f"Data directory {data_dir} does not exist")
        
        json_files = list(data_path.glob("*.json"))
        if not json_files:
            raise ValueError(f"No JSON files found in {data_dir}")
        
        print(f"Found {len(json_files)} data files")
        
        for json_file in json_files:
            with open(json_file, 'r', encoding='utf-8') as f:
                samples = json.load(f)
            
            for sample in samples:
                sign = sample['sign']
                sequence = sample['sequence']
                
                # Map label to index
                if sign not in label_map:
                    label_map[sign] = current_idx
                    current_idx += 1
                
                all_sequences.append(sequence)
                all_labels.append(label_map[sign])
        
        self.label_map = label_map
        print(f"\nLoaded {len(all_sequences)} samples")
        print(f"Classes: {label_map}")
        
        # Print class distribution
        for sign, idx in label_map.items():
            count = all_labels.count(idx)
            print(f"  {sign}: {count} samples")
        
        return all_sequences, np.array(all_labels), label_map
    
    def preprocess_sequences(self, sequences):
        """Normalize and pad sequences to fixed length"""
        processed = []
        
        for seq in sequences:
            # Convert to numpy
            seq = np.array(seq)
            
            # Pad or truncate to sequence_length
            if len(seq) < self.sequence_length:
                # Pad with zeros
                padding = np.zeros((self.sequence_length - len(seq), 21, 3))
                seq = np.vstack([seq, padding])
            elif len(seq) > self.sequence_length:
                # Take last frames
                seq = seq[-self.sequence_length:]
            
            # Flatten landmarks: (30, 21, 3) → (30, 63)
            seq = seq.reshape(self.sequence_length, -1)
            
            # Normalize
            mean = seq.mean()
            std = seq.std()
            if std > 0:
                seq = (seq - mean) / std
            
            processed.append(seq)
        
        return np.array(processed)
    
    def train(self, X_train, y_train, X_val, y_val, epochs=50, batch_size=32):
        """Train the model"""
        if self.model is None:
            self.build_model()
        
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                verbose=1
            ),
            tf.keras.callbacks.ModelCheckpoint(
                'models/best_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate(self, X_test, y_test):
        """Evaluate model performance"""
        test_loss, test_acc = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"\nTest Loss: {test_loss:.4f}")
        print(f"Test Accuracy: {test_acc*100:.2f}%")
        return test_loss, test_acc
    
    def save(self, model_path='models/korean_sign_lstm.h5', label_map_path='models/label_map.json'):
        """Save model and label map"""
        self.model.save(model_path)
        print(f"Model saved to {model_path}")
        
        with open(label_map_path, 'w', encoding='utf-8') as f:
            json.dump(self.label_map, f, ensure_ascii=False, indent=2)
        print(f"Label map saved to {label_map_path}")
    
    def load(self, model_path='models/korean_sign_lstm.h5', label_map_path='models/label_map.json'):
        """Load trained model and label map"""
        self.model = tf.keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
        
        with open(label_map_path, 'r', encoding='utf-8') as f:
            self.label_map = json.load(f)
        print(f"Label map loaded: {self.label_map}")
    
    def predict(self, sequence):
        """Predict sign from landmark sequence"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load() first.")
        
        # Preprocess
        processed = self.preprocess_sequences([sequence])
        
        # Predict
        prediction = self.model.predict(processed, verbose=0)[0]
        class_idx = np.argmax(prediction)
        confidence = float(prediction[class_idx])
        
        # Get sign name
        sign_name = None
        for sign, idx in self.label_map.items():
            if idx == class_idx:
                sign_name = sign
                break
        
        return sign_name, confidence


def plot_training_history(history):
    """Plot training history"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy
    ax1.plot(history.history['accuracy'], label='Train')
    ax1.plot(history.history['val_accuracy'], label='Validation')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    # Loss
    ax2.plot(history.history['loss'], label='Train')
    ax2.plot(history.history['val_loss'], label='Validation')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('models/training_history.png', dpi=150)
    print("Training history saved to models/training_history.png")


if __name__ == "__main__":
    print("Korean Sign Language LSTM Model")
    print("=" * 50)
    
    # Create model
    model = SignLanguageLSTM()
    
    # Build and show summary
    model.build_model()
    print("\nModel Architecture:")
    model.model.summary()
