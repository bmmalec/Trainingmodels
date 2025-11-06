"""
Example Usage Script
Demonstrates how to use the math training components programmatically.
"""

from generate_math_dataset import MathDatasetGenerator
import os


def example_dataset_generation():
    """Example: Generate and save a small dataset."""
    print("="*60)
    print("Example 1: Dataset Generation")
    print("="*60)

    # Create generator
    generator = MathDatasetGenerator(max_number=50)

    # Generate some problems
    print("\nGenerating 5 random problems:")
    for i in range(5):
        problem = generator.generate_problem()
        print(f"{i+1}. {problem['input']}")
        print(f"   {problem['output']} ({problem['operation']})")

    # Generate a dataset with custom distribution
    print("\nGenerating dataset with custom distribution...")
    dataset = generator.generate_dataset(
        num_samples=100,
        operation_distribution={
            'addition': 0.5,      # 50% addition
            'subtraction': 0.3,   # 30% subtraction
            'multiplication': 0.15,  # 15% multiplication
            'division': 0.05      # 5% division
        }
    )

    print(f"Generated {len(dataset)} problems")

    # Count operations
    from collections import Counter
    op_counts = Counter(item['operation'] for item in dataset)
    print("\nOperation distribution:")
    for op, count in op_counts.items():
        print(f"  {op}: {count} ({count/len(dataset)*100:.1f}%)")

    # Save to file
    os.makedirs('examples', exist_ok=True)
    generator.save_dataset(dataset, 'examples/sample_dataset.jsonl', format='jsonl')
    print("\nDataset saved to examples/sample_dataset.jsonl")


def example_specific_operations():
    """Example: Generate specific types of problems."""
    print("\n" + "="*60)
    print("Example 2: Specific Operations")
    print("="*60)

    generator = MathDatasetGenerator(max_number=100)

    # Generate only multiplication problems
    print("\nMultiplication problems:")
    for i in range(3):
        problem = generator.generate_problem(operation='multiplication')
        print(f"  {problem['input']} → {problem['output']}")

    # Generate only division problems
    print("\nDivision problems:")
    for i in range(3):
        problem = generator.generate_problem(operation='division')
        print(f"  {problem['input']} → {problem['output']}")


def example_large_dataset():
    """Example: Generate a complete training dataset."""
    print("\n" + "="*60)
    print("Example 3: Complete Dataset Generation")
    print("="*60)

    generator = MathDatasetGenerator(max_number=1000)

    print("\nGenerating complete dataset splits...")

    # Training data
    print("  Generating training data (1000 samples)...")
    train_data = generator.generate_dataset(1000)

    # Validation data
    print("  Generating validation data (200 samples)...")
    val_data = generator.generate_dataset(200)

    # Test data
    print("  Generating test data (200 samples)...")
    test_data = generator.generate_dataset(200)

    # Save all splits
    os.makedirs('examples', exist_ok=True)
    generator.save_dataset(train_data, 'examples/mini_train.jsonl')
    generator.save_dataset(val_data, 'examples/mini_val.jsonl')
    generator.save_dataset(test_data, 'examples/mini_test.jsonl')

    print("\n✓ Complete dataset saved to examples/")
    print(f"  Training: {len(train_data)} samples")
    print(f"  Validation: {len(val_data)} samples")
    print(f"  Test: {len(test_data)} samples")


def example_difficulty_levels():
    """Example: Generate datasets with different difficulty levels."""
    print("\n" + "="*60)
    print("Example 4: Different Difficulty Levels")
    print("="*60)

    # Easy: Numbers up to 20
    print("\nEasy level (numbers 1-20):")
    easy_gen = MathDatasetGenerator(max_number=20)
    for i in range(3):
        problem = easy_gen.generate_problem()
        print(f"  {problem['input']}")

    # Medium: Numbers up to 100
    print("\nMedium level (numbers 1-100):")
    medium_gen = MathDatasetGenerator(max_number=100)
    for i in range(3):
        problem = medium_gen.generate_problem()
        print(f"  {problem['input']}")

    # Hard: Numbers up to 1000
    print("\nHard level (numbers 1-1000):")
    hard_gen = MathDatasetGenerator(max_number=1000)
    for i in range(3):
        problem = hard_gen.generate_problem()
        print(f"  {problem['input']}")


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("LLM Math Training - Example Usage")
    print("="*60)

    example_dataset_generation()
    example_specific_operations()
    example_large_dataset()
    example_difficulty_levels()

    print("\n" + "="*60)
    print("Examples Complete!")
    print("="*60)
    print("\nCheck the 'examples/' directory for generated datasets.")
    print("\nNext steps:")
    print("  1. Run 'python generate_math_dataset.py' to generate full datasets")
    print("  2. Run 'python train_math_llm.py' to train a model")
    print("  3. Run 'python inference.py' to test the trained model")
    print()


if __name__ == '__main__':
    main()
