
def compute_complexity(params: dict) -> tuple[int, int]:
    n = int(params.get("n", 100))
    complexity = n ** 3
    est = max(1, int(complexity / 10000))
    return complexity, est