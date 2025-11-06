# LLM Math Training

A complete pipeline for training a language model on simple arithmetic problems. This project allows you to fine-tune small language models (like GPT-2, DistilGPT-2, or TinyLlama) to solve basic math problems.

## Features

- **Dataset Generation**: Automatically generates arithmetic problems (addition, subtraction, multiplication, division)
- **Model Training**: Fine-tunes pre-trained language models using HuggingFace Transformers
- **Evaluation**: Comprehensive evaluation metrics and accuracy testing
- **Interactive Inference**: Test your trained model with custom questions
- **Configurable**: Easy configuration through YAML files

## Project Structure

```
.
├── generate_math_dataset.py   # Dataset generation script
├── train_math_llm.py          # Main training script
├── evaluate_model.py          # Model evaluation script
├── inference.py               # Interactive testing script
├── config.yaml                # Training configuration
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Trainingmodels
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Install PyTorch with CUDA support for GPU training:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

## Quick Start

### Step 1: Generate Dataset

Generate training, validation, and test datasets:

```bash
python generate_math_dataset.py \
    --num_train 10000 \
    --num_val 1000 \
    --num_test 1000 \
    --max_number 100 \
    --output_dir data
```

This creates three files in the `data/` directory:
- `train.jsonl`: Training data
- `val.jsonl`: Validation data
- `test.jsonl`: Test data

### Step 2: Train the Model

Train a model on the generated dataset:

```bash
python train_math_llm.py \
    --model_name distilgpt2 \
    --train_data data/train.jsonl \
    --val_data data/val.jsonl \
    --output_dir output \
    --num_epochs 3 \
    --batch_size 8 \
    --learning_rate 2e-5
```

**Available Models:**
- `distilgpt2` (lightweight, fast training, ~82M parameters)
- `gpt2` (124M parameters)
- `gpt2-medium` (355M parameters)
- `TinyLlama/TinyLlama-1.1B-Chat-v1.0` (1.1B parameters)

The trained model will be saved to `output/final_model/`.

### Step 3: Evaluate the Model

Test the model's accuracy:

```bash
python evaluate_model.py \
    --model_path output/final_model \
    --test_data data/test.jsonl \
    --max_samples 1000
```

This will output:
- Overall accuracy
- Sample correct predictions
- Sample incorrect predictions
- Detailed results saved to `evaluation_results.json`

### Step 4: Interactive Testing

Try your model with custom questions:

```bash
python inference.py --model_path output/final_model
```

Or test a single question:

```bash
python inference.py --model_path output/final_model --question "What is 42 + 17?"
```

## Dataset Format

The dataset uses JSONL format where each line is a JSON object:

```json
{"input": "What is 25 + 17?", "output": "The answer is 42.", "operation": "addition"}
{"input": "What is 100 - 45?", "output": "The answer is 55.", "operation": "subtraction"}
{"input": "What is 8 × 7?", "output": "The answer is 56.", "operation": "multiplication"}
{"input": "What is 144 ÷ 12?", "output": "The answer is 12.", "operation": "division"}
```

## Configuration

Edit `config.yaml` to customize training parameters:

```yaml
model:
  name: "distilgpt2"
  max_length: 512

training:
  num_epochs: 3
  batch_size: 8
  learning_rate: 2.0e-5
  gradient_accumulation_steps: 4
```

## Advanced Usage

### Custom Dataset Parameters

Generate datasets with specific operation distributions:

```python
from generate_math_dataset import MathDatasetGenerator

generator = MathDatasetGenerator(max_number=1000)

# Custom distribution: more addition, less division
dataset = generator.generate_dataset(
    num_samples=5000,
    operation_distribution={
        'addition': 0.4,
        'subtraction': 0.3,
        'multiplication': 0.2,
        'division': 0.1
    }
)
```

### Training with Custom Hyperparameters

```bash
python train_math_llm.py \
    --model_name gpt2-medium \
    --num_epochs 5 \
    --batch_size 4 \
    --gradient_accumulation_steps 8 \
    --learning_rate 1e-5 \
    --warmup_steps 1000 \
    --save_steps 500
```

### Monitoring Training with TensorBoard

```bash
tensorboard --logdir output/logs
```

## Performance Tips

1. **GPU Training**: Use a GPU for faster training. The scripts automatically detect and use CUDA if available.

2. **Batch Size**: If you run out of memory, reduce `--batch_size` and increase `--gradient_accumulation_steps` to maintain effective batch size.

3. **Model Size**: Start with `distilgpt2` for quick experiments, then move to larger models for better performance.

4. **Dataset Size**: More training data generally improves performance. Try 50k-100k samples for production use.

5. **Learning Rate**: Use 2e-5 for GPT-2 models, 5e-5 for smaller models like DistilGPT-2.

## Expected Results

With the default configuration (10k training samples, distilgpt2):
- Training time: ~30-60 minutes on GPU, 2-4 hours on CPU
- Expected accuracy: 85-95% on simple arithmetic
- Model size: ~250MB

## Troubleshooting

**Out of Memory Error:**
- Reduce batch size: `--batch_size 4` or `--batch_size 2`
- Reduce max length: `--max_length 256`
- Use a smaller model: `distilgpt2` instead of `gpt2`

**Low Accuracy:**
- Increase training data: `--num_train 50000`
- Train for more epochs: `--num_epochs 5`
- Use a larger model: `gpt2` instead of `distilgpt2`
- Check if model is actually learning (monitor loss in TensorBoard)

**Slow Training:**
- Enable GPU acceleration (install PyTorch with CUDA)
- Increase batch size if memory allows
- Use a smaller model for faster iteration

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Citation

If you use this project in your research, please cite:

```bibtex
@misc{llm-math-training,
  title={LLM Math Training Pipeline},
  author={Your Name},
  year={2024},
  publisher={GitHub},
  url={https://github.com/yourusername/Trainingmodels}
}
```
