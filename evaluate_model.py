"""
Model Evaluation Script
Tests the trained model on math problems and computes accuracy.
"""

import json
import argparse
import torch
import re
from typing import List, Dict, Tuple
from transformers import AutoTokenizer, AutoModelForCausalLM
from tqdm import tqdm


class MathEvaluator:
    """Evaluates math model performance."""

    def __init__(self, model_path: str, device: str = None):
        """Initialize evaluator with trained model.

        Args:
            model_path: Path to trained model
            device: Device to use (cuda/cpu). Auto-detects if None.
        """
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device

        print(f"Loading model from {model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if self.device == 'cuda' else torch.float32
        ).to(self.device)
        self.model.eval()

        print(f"Model loaded on {self.device}")

    def load_test_data(self, data_path: str) -> List[Dict]:
        """Load test data from file."""
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

    def extract_answer(self, text: str) -> str:
        """Extract numerical answer from generated text."""
        # Look for patterns like "The answer is X" or just numbers
        match = re.search(r'(?:answer is|=)\s*(-?\d+(?:\.\d+)?)', text, re.IGNORECASE)
        if match:
            return match.group(1)

        # Fallback: find any number in the text
        match = re.search(r'(-?\d+(?:\.\d+)?)', text)
        if match:
            return match.group(1)

        return ""

    def generate_answer(self, question: str, max_new_tokens: int = 50) -> str:
        """Generate answer for a question.

        Args:
            question: The math question
            max_new_tokens: Maximum tokens to generate

        Returns:
            Generated answer text
        """
        prompt = f"Question: {question}\nAnswer:"

        inputs = self.tokenizer(prompt, return_tensors='pt').to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,  # Greedy decoding for consistency
                pad_token_id=self.tokenizer.eos_token_id,
                temperature=0.1,
            )

        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract just the answer part (after "Answer:")
        if "Answer:" in generated_text:
            answer = generated_text.split("Answer:")[-1].strip()
        else:
            answer = generated_text

        return answer

    def evaluate(
        self,
        test_data: List[Dict],
        max_samples: int = None,
        verbose: bool = True
    ) -> Dict:
        """Evaluate model on test data.

        Args:
            test_data: List of test examples
            max_samples: Maximum number of samples to evaluate
            verbose: Print individual results

        Returns:
            Dictionary with evaluation metrics
        """
        if max_samples:
            test_data = test_data[:max_samples]

        correct = 0
        total = len(test_data)
        results = []

        print(f"\nEvaluating on {total} samples...")

        for item in tqdm(test_data, desc="Evaluating"):
            question = item['input']
            expected_answer = item['output']

            # Generate answer
            generated_answer = self.generate_answer(question)

            # Extract numerical values
            expected_num = self.extract_answer(expected_answer)
            generated_num = self.extract_answer(generated_answer)

            # Check if correct
            is_correct = expected_num == generated_num and expected_num != ""

            if is_correct:
                correct += 1

            result = {
                'question': question,
                'expected': expected_answer,
                'generated': generated_answer,
                'expected_num': expected_num,
                'generated_num': generated_num,
                'correct': is_correct
            }
            results.append(result)

            if verbose and not is_correct:
                print(f"\n❌ Question: {question}")
                print(f"   Expected: {expected_answer} ({expected_num})")
                print(f"   Generated: {generated_answer} ({generated_num})")

        accuracy = correct / total if total > 0 else 0

        metrics = {
            'total_samples': total,
            'correct': correct,
            'accuracy': accuracy,
            'results': results
        }

        return metrics

    def print_summary(self, metrics: Dict):
        """Print evaluation summary."""
        print("\n" + "="*60)
        print("EVALUATION SUMMARY")
        print("="*60)
        print(f"Total Samples: {metrics['total_samples']}")
        print(f"Correct: {metrics['correct']}")
        print(f"Accuracy: {metrics['accuracy']:.2%}")
        print("="*60)

        # Show some correct examples
        print("\n✓ Sample Correct Predictions:")
        correct_examples = [r for r in metrics['results'] if r['correct']][:5]
        for ex in correct_examples:
            print(f"  Q: {ex['question']}")
            print(f"  A: {ex['generated']}\n")

        # Show some incorrect examples
        incorrect_examples = [r for r in metrics['results'] if not r['correct']][:5]
        if incorrect_examples:
            print("✗ Sample Incorrect Predictions:")
            for ex in incorrect_examples:
                print(f"  Q: {ex['question']}")
                print(f"  Expected: {ex['expected']}")
                print(f"  Got: {ex['generated']}\n")


def main():
    parser = argparse.ArgumentParser(description='Evaluate trained math model')
    parser.add_argument('--model_path', type=str, default='output/final_model',
                       help='Path to trained model')
    parser.add_argument('--test_data', type=str, default='data/test.jsonl',
                       help='Path to test data')
    parser.add_argument('--max_samples', type=int, default=None,
                       help='Maximum number of samples to evaluate')
    parser.add_argument('--output_file', type=str, default='evaluation_results.json',
                       help='Path to save detailed results')
    parser.add_argument('--verbose', action='store_true',
                       help='Print individual results')

    args = parser.parse_args()

    # Initialize evaluator
    evaluator = MathEvaluator(args.model_path)

    # Load test data
    test_data = evaluator.load_test_data(args.test_data)
    print(f"Loaded {len(test_data)} test samples")

    # Evaluate
    metrics = evaluator.evaluate(
        test_data,
        max_samples=args.max_samples,
        verbose=args.verbose
    )

    # Print summary
    evaluator.print_summary(metrics)

    # Save results
    with open(args.output_file, 'w') as f:
        # Don't save individual results to keep file size manageable
        save_metrics = {
            'total_samples': metrics['total_samples'],
            'correct': metrics['correct'],
            'accuracy': metrics['accuracy']
        }
        json.dump(save_metrics, f, indent=2)

    print(f"\nResults saved to {args.output_file}")


if __name__ == '__main__':
    main()
