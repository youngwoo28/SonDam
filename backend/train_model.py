"""
Training script for Korean Sign Language LSTM model
Run this after collecting data samples
"""

import sys
from lstm_model import SignLanguageLSTM, plot_training_history
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
import numpy as np


def main():
    print("=" * 60)
    print("Korean Sign Language LSTM Training")
    print("=" * 60)
    
    # Create model instance
    model = SignLanguageLSTM(num_classes=10, sequence_length=30)
    
    try:
        # Load data
        print("\n[1/5] Loading collected data...")
        X, y, label_map = model.load_collected_data("collected_data")
        
        # Check minimum samples
        min_samples_per_class = 10
        for sign, idx in label_map.items():
            count = (y == idx).sum()
            if count < min_samples_per_class:
                print(f"\n⚠️  Warning: '{sign}' has only {count} samples (minimum: {min_samples_per_class})")
                print(f"   Consider collecting more samples for better accuracy")
        
        # Preprocess
        print("\n[2/5] Preprocessing sequences...")
        X = model.preprocess_sequences(X)
        print(f"Preprocessed shape: {X.shape}")
        
        # Update num_classes
        model.num_classes = len(label_map)
        
        # Convert labels to categorical
        y = to_categorical(y, num_classes=len(label_map))
        
        # Split data
        print("\n[3/5] Splitting data (80% train, 20% test)...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y.argmax(axis=1)
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        
        # Build model
        print("\n[4/5] Building model...")
        model.build_model()
        model.model.summary()
        
        # Train
        print("\n[5/5] Training model...")
        print("-" * 60)
        history = model.train(
            X_train, y_train,
            X_test, y_test,
            epochs=50,
            batch_size=32
        )
        
        # Evaluate
        print("\n" + "=" * 60)
        print("Final Evaluation:")
        print("=" * 60)
        model.evaluate(X_test, y_test)
        
        # Save
        print("\n" + "=" * 60)
        print("Saving model...")
        print("=" * 60)
        model.save()
        
        # Plot history
        print("\nGenerating training plots...")
        plot_training_history(history)
        
        print("\n" + "=" * 60)
        print("✅ Training Complete!")
        print("=" * 60)
        print(f"\nModel saved to: models/korean_sign_lstm.h5")
        print(f"Label map saved to: models/label_map.json")
        print(f"Training plot saved to: models/training_history.png")
        
        print("\nNext steps:")
        print("1. Check training_history.png for accuracy/loss curves")
        print("2. Update sign_recognizer.py to use the trained model")
        print("3. Test with real-time recognition")
        
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure you have:")
        print("1. Collected data using the data collection tool")
        print("2. Saved JSON files to backend/collected_data/")
        print("3. At least 10 samples per sign")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
