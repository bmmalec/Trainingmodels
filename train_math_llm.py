"""
LLM Math Training Script
Fine-tunes a language model on simple math problems.
"""

import os
import json
import argparse
import torch
from typing import List, Dict
from dataclasses import dataclass
from torch.utils.data import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)


class MathDataset(Dataset):
    """Dataset for math problems."""

    def __init__(self, data_path: str, tokenizer, max_length: int = 512):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.data = self._load_data(data_path)

    def _load_data(self, data_path: str) -> List[Dict]:
        """Load data from JSONL or JSON file."""
        data = []

        if data_path.endswith('.jsonl'):
            with open(data_path, 'r') as f:
                for line in f:
                    data.append(json.loads(line.strip()))
        elif data_path.endswith('.json'):
            with open(data_path, 'r') as f:
                data = json.load(f)
        else:
            raise ValueError(f"Unsupported file format: {data_path}")

        return data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]

        # Format: "Question: {input}\nAnswer: {output}"
        text = f"Question: {item['input']}\nAnswer: {item['output']}"

        # Tokenize
        encodings = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding='max_length',
            return_tensors='pt'
        )

        return {
            'input_ids': encodings['input_ids'].squeeze(),
            'attention_mask': encodings['attention_mask'].squeeze(),
            'labels': encodings['input_ids'].squeeze()
        }


def compute_metrics(eval_pred):
    """Compute metrics for evaluation."""
    predictions, labels = eval_pred

    # For language modeling, we typically track perplexity
    # which is computed from loss, so we return empty dict here
    return {}


def train_model(
    model_name: str,
    train_data_path: str,
    val_data_path: str,
    output_dir: str,
    num_epochs: int = 3,
    batch_size: int = 8,
    learning_rate: float = 2e-5,
    max_length: int = 512,
    gradient_accumulation_steps: int = 4,
    warmup_steps: int = 500,
    save_steps: int = 1000,
    logging_steps: int = 100,
):
    """Train the model on math problems.

    Args:
        model_name: Name or path of the pretrained model
        train_data_path: Path to training data
        val_data_path: Path to validation data
        output_dir: Directory to save model checkpoints
        num_epochs: Number of training epochs
        batch_size: Batch size per device
        learning_rate: Learning rate
        max_length: Maximum sequence length
        gradient_accumulation_steps: Gradient accumulation steps
        warmup_steps: Number of warmup steps
        save_steps: Save checkpoint every N steps
        logging_steps: Log every N steps
    """
    print(f"Loading tokenizer and model: {model_name}")

    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Set pad token if not exists
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map='auto' if torch.cuda.is_available() else None
    )

    # Resize token embeddings if needed
    model.resize_token_embeddings(len(tokenizer))

    print("Loading datasets...")
    train_dataset = MathDataset(train_data_path, tokenizer, max_length)
    val_dataset = MathDataset(val_data_path, tokenizer, max_length)

    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        warmup_steps=warmup_steps,
        logging_steps=logging_steps,
        save_steps=save_steps,
        eval_steps=save_steps,
        evaluation_strategy='steps',
        save_total_limit=3,
        load_best_model_at_end=True,
        metric_for_best_model='eval_loss',
        greater_is_better=False,
        fp16=torch.cuda.is_available(),
        report_to='tensorboard',
        logging_dir=f'{output_dir}/logs',
        push_to_hub=False,
    )

    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Causal language modeling
    )

    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    print("\nStarting training...")
    trainer.train()

    print("\nSaving final model...")
    trainer.save_model(f"{output_dir}/final_model")
    tokenizer.save_pretrained(f"{output_dir}/final_model")

    print(f"\nTraining complete! Model saved to {output_dir}/final_model")

    # Evaluate on validation set
    print("\nEvaluating on validation set...")
    eval_results = trainer.evaluate()
    print(f"Validation results: {eval_results}")

    return trainer


def main():
    parser = argparse.ArgumentParser(description='Train LLM on math problems')
    parser.add_argument('--model_name', type=str, default='distilgpt2',
                       help='Pretrained model name (e.g., distilgpt2, gpt2, TinyLlama/TinyLlama-1.1B-Chat-v1.0)')
    parser.add_argument('--train_data', type=str, default='data/train.jsonl',
                       help='Path to training data')
    parser.add_argument('--val_data', type=str, default='data/val.jsonl',
                       help='Path to validation data')
    parser.add_argument('--output_dir', type=str, default='output',
                       help='Output directory for model checkpoints')
    parser.add_argument('--num_epochs', type=int, default=3,
                       help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=8,
                       help='Batch size per device')
    parser.add_argument('--learning_rate', type=float, default=2e-5,
                       help='Learning rate')
    parser.add_argument('--max_length', type=int, default=512,
                       help='Maximum sequence length')
    parser.add_argument('--gradient_accumulation_steps', type=int, default=4,
                       help='Gradient accumulation steps')
    parser.add_argument('--warmup_steps', type=int, default=500,
                       help='Number of warmup steps')
    parser.add_argument('--save_steps', type=int, default=1000,
                       help='Save checkpoint every N steps')
    parser.add_argument('--logging_steps', type=int, default=100,
                       help='Log every N steps')

    args = parser.parse_args()

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Train model
    train_model(
        model_name=args.model_name,
        train_data_path=args.train_data,
        val_data_path=args.val_data,
        output_dir=args.output_dir,
        num_epochs=args.num_epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        max_length=args.max_length,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        warmup_steps=args.warmup_steps,
        save_steps=args.save_steps,
        logging_steps=args.logging_steps,
    )


if __name__ == '__main__':
    main()
