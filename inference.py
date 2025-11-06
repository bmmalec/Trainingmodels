"""
Interactive Math Inference Script
Test the trained model with custom questions.
"""

import argparse
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


class MathSolver:
    """Interactive math problem solver using trained LLM."""

    def __init__(self, model_path: str, device: str = None):
        """Initialize solver with trained model.

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
        print("Ready to solve math problems!\n")

    def solve(self, question: str, max_new_tokens: int = 50) -> str:
        """Solve a math problem.

        Args:
            question: The math question
            max_new_tokens: Maximum tokens to generate

        Returns:
            Generated answer
        """
        # Format prompt
        prompt = f"Question: {question}\nAnswer:"

        # Tokenize
        inputs = self.tokenizer(prompt, return_tensors='pt').to(self.device)

        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
                pad_token_id=self.tokenizer.eos_token_id,
                temperature=0.1,
            )

        # Decode
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract answer part
        if "Answer:" in generated_text:
            answer = generated_text.split("Answer:")[-1].strip()
        else:
            answer = generated_text

        return answer

    def interactive_mode(self):
        """Run in interactive mode."""
        print("="*60)
        print("INTERACTIVE MATH SOLVER")
        print("="*60)
        print("Enter math questions (or 'quit' to exit)")
        print("Examples:")
        print("  - What is 25 + 17?")
        print("  - What is 100 - 45?")
        print("  - What is 8 × 7?")
        print("  - What is 144 ÷ 12?")
        print("="*60 + "\n")

        while True:
            try:
                question = input("Question: ").strip()

                if question.lower() in ['quit', 'exit', 'q']:
                    print("Goodbye!")
                    break

                if not question:
                    continue

                # Solve the problem
                answer = self.solve(question)

                print(f"Answer: {answer}\n")

            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                print(f"Error: {e}\n")


def main():
    parser = argparse.ArgumentParser(description='Solve math problems with trained LLM')
    parser.add_argument('--model_path', type=str, default='output/final_model',
                       help='Path to trained model')
    parser.add_argument('--question', type=str, default=None,
                       help='Single question to solve (optional)')
    parser.add_argument('--max_new_tokens', type=int, default=50,
                       help='Maximum tokens to generate')

    args = parser.parse_args()

    # Initialize solver
    solver = MathSolver(args.model_path)

    if args.question:
        # Single question mode
        answer = solver.solve(args.question, args.max_new_tokens)
        print(f"Question: {args.question}")
        print(f"Answer: {answer}")
    else:
        # Interactive mode
        solver.interactive_mode()


if __name__ == '__main__':
    main()
