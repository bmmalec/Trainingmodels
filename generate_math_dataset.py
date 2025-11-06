"""
Simple Math Dataset Generator for LLM Training
Generates arithmetic problems with their solutions.
"""

import random
import json
import argparse
from typing import List, Dict, Tuple


class MathDatasetGenerator:
    """Generates simple math problems for training."""

    def __init__(self, max_number: int = 100):
        self.max_number = max_number
        self.operations = {
            'addition': self._generate_addition,
            'subtraction': self._generate_subtraction,
            'multiplication': self._generate_multiplication,
            'division': self._generate_division
        }

    def _generate_addition(self) -> Tuple[str, str, int]:
        """Generate an addition problem."""
        a = random.randint(1, self.max_number)
        b = random.randint(1, self.max_number)
        problem = f"What is {a} + {b}?"
        solution = f"The answer is {a + b}."
        return problem, solution, a + b

    def _generate_subtraction(self) -> Tuple[str, str, int]:
        """Generate a subtraction problem."""
        a = random.randint(1, self.max_number)
        b = random.randint(1, a)  # Ensure non-negative result
        problem = f"What is {a} - {b}?"
        solution = f"The answer is {a - b}."
        return problem, solution, a - b

    def _generate_multiplication(self) -> Tuple[str, str, int]:
        """Generate a multiplication problem."""
        a = random.randint(1, min(20, self.max_number))  # Keep numbers smaller
        b = random.randint(1, min(20, self.max_number))
        problem = f"What is {a} × {b}?"
        solution = f"The answer is {a * b}."
        return problem, solution, a * b

    def _generate_division(self) -> Tuple[str, str, float]:
        """Generate a division problem with whole number results."""
        b = random.randint(1, min(20, self.max_number))
        result = random.randint(1, min(20, self.max_number))
        a = b * result  # Ensure clean division
        problem = f"What is {a} ÷ {b}?"
        solution = f"The answer is {result}."
        return problem, solution, result

    def generate_problem(self, operation: str = None) -> Dict[str, str]:
        """Generate a single math problem.

        Args:
            operation: Type of operation (addition, subtraction, multiplication, division)
                      If None, randomly selects an operation.

        Returns:
            Dictionary with 'input' (problem) and 'output' (solution)
        """
        if operation is None:
            operation = random.choice(list(self.operations.keys()))

        if operation not in self.operations:
            raise ValueError(f"Unknown operation: {operation}")

        problem, solution, _ = self.operations[operation]()

        return {
            'input': problem,
            'output': solution,
            'operation': operation
        }

    def generate_dataset(
        self,
        num_samples: int,
        operation_distribution: Dict[str, float] = None
    ) -> List[Dict[str, str]]:
        """Generate a dataset of math problems.

        Args:
            num_samples: Number of problems to generate
            operation_distribution: Dictionary mapping operation names to probabilities
                                   If None, uses uniform distribution

        Returns:
            List of problem dictionaries
        """
        if operation_distribution is None:
            operation_distribution = {op: 1.0 for op in self.operations.keys()}

        # Normalize distribution
        total = sum(operation_distribution.values())
        operation_distribution = {k: v/total for k, v in operation_distribution.items()}

        dataset = []
        operations = list(operation_distribution.keys())
        probabilities = [operation_distribution[op] for op in operations]

        for _ in range(num_samples):
            operation = random.choices(operations, weights=probabilities)[0]
            dataset.append(self.generate_problem(operation))

        return dataset

    def save_dataset(
        self,
        dataset: List[Dict[str, str]],
        filename: str,
        format: str = 'jsonl'
    ):
        """Save dataset to file.

        Args:
            dataset: List of problem dictionaries
            filename: Output filename
            format: 'jsonl' or 'json'
        """
        if format == 'jsonl':
            with open(filename, 'w') as f:
                for item in dataset:
                    f.write(json.dumps(item) + '\n')
        elif format == 'json':
            with open(filename, 'w') as f:
                json.dumps(dataset, f, indent=2)
        else:
            raise ValueError(f"Unknown format: {format}")

        print(f"Saved {len(dataset)} problems to {filename}")


def main():
    parser = argparse.ArgumentParser(description='Generate math dataset for LLM training')
    parser.add_argument('--num_train', type=int, default=10000,
                       help='Number of training samples')
    parser.add_argument('--num_val', type=int, default=1000,
                       help='Number of validation samples')
    parser.add_argument('--num_test', type=int, default=1000,
                       help='Number of test samples')
    parser.add_argument('--max_number', type=int, default=100,
                       help='Maximum number in problems')
    parser.add_argument('--output_dir', type=str, default='data',
                       help='Output directory for datasets')
    parser.add_argument('--format', type=str, default='jsonl',
                       choices=['jsonl', 'json'],
                       help='Output format')

    args = parser.parse_args()

    # Create output directory
    import os
    os.makedirs(args.output_dir, exist_ok=True)

    # Initialize generator
    generator = MathDatasetGenerator(max_number=args.max_number)

    # Generate datasets
    print("Generating training dataset...")
    train_data = generator.generate_dataset(args.num_train)
    generator.save_dataset(
        train_data,
        f"{args.output_dir}/train.{args.format}",
        format=args.format
    )

    print("Generating validation dataset...")
    val_data = generator.generate_dataset(args.num_val)
    generator.save_dataset(
        val_data,
        f"{args.output_dir}/val.{args.format}",
        format=args.format
    )

    print("Generating test dataset...")
    test_data = generator.generate_dataset(args.num_test)
    generator.save_dataset(
        test_data,
        f"{args.output_dir}/test.{args.format}",
        format=args.format
    )

    print(f"\nDataset generation complete!")
    print(f"Training samples: {args.num_train}")
    print(f"Validation samples: {args.num_val}")
    print(f"Test samples: {args.num_test}")


if __name__ == '__main__':
    main()
