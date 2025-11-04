import numpy as np

def compute_complexity(params: dict) -> tuple[int, int]:
    n = int(params.get("n", 100))
    complexity = n ** 3
    est = max(1, int(complexity / 10000))
    return complexity, est


def generate_matrix(n: int) -> list[list[int]]:
    import random
    with open("matrix.txt", "w") as f:
        matrix = [[random.randint(0, 10) for _ in range(n)] for _ in range(n)]
        for row in matrix:
            f.write(" ".join(map(str, row)) + "\n")

def read_matrix_from_file(filepath: str) -> list[list[int]]:
    try:
        matrix = np.loadtxt(filepath, dtype=int)
        return matrix.tolist()
    except FileNotFoundError:
        print("Error: 'matrix.txt' not found.")
    except ValueError:
        print("Error: Data in 'matrix.txt' is not compatible with specified dtype or delimiter.")      


def swap(A: np.ndarray, b: np.ndarray, i, j):
    tmp = A[i, :].copy()
    A[i, :] = A[j, :]
    A[j, :] = tmp

    tmp = b[i]
    b[i] = b[j]
    b[j] = tmp

    return A, b