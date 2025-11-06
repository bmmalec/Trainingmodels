#!/bin/bash

# Full Pipeline for LLM Math Training
# This script runs the complete pipeline: dataset generation, training, and evaluation

set -e  # Exit on error

echo "========================================="
echo "LLM Math Training - Full Pipeline"
echo "========================================="
echo ""

# Configuration
NUM_TRAIN=${NUM_TRAIN:-10000}
NUM_VAL=${NUM_VAL:-1000}
NUM_TEST=${NUM_TEST:-1000}
MODEL_NAME=${MODEL_NAME:-distilgpt2}
NUM_EPOCHS=${NUM_EPOCHS:-3}
BATCH_SIZE=${BATCH_SIZE:-8}

echo "Configuration:"
echo "  Training samples: $NUM_TRAIN"
echo "  Validation samples: $NUM_VAL"
echo "  Test samples: $NUM_TEST"
echo "  Model: $MODEL_NAME"
echo "  Epochs: $NUM_EPOCHS"
echo "  Batch size: $BATCH_SIZE"
echo ""

# Step 1: Generate Dataset
echo "Step 1/3: Generating dataset..."
python generate_math_dataset.py \
    --num_train $NUM_TRAIN \
    --num_val $NUM_VAL \
    --num_test $NUM_TEST \
    --output_dir data

echo ""
echo "✓ Dataset generation complete!"
echo ""

# Step 2: Train Model
echo "Step 2/3: Training model..."
python train_math_llm.py \
    --model_name $MODEL_NAME \
    --train_data data/train.jsonl \
    --val_data data/val.jsonl \
    --output_dir output \
    --num_epochs $NUM_EPOCHS \
    --batch_size $BATCH_SIZE \
    --learning_rate 2e-5

echo ""
echo "✓ Training complete!"
echo ""

# Step 3: Evaluate Model
echo "Step 3/3: Evaluating model..."
python evaluate_model.py \
    --model_path output/final_model \
    --test_data data/test.jsonl \
    --output_file evaluation_results.json

echo ""
echo "========================================="
echo "Pipeline Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Check evaluation_results.json for metrics"
echo "  2. Run 'python inference.py' for interactive testing"
echo "  3. View training logs: tensorboard --logdir output/logs"
echo ""
