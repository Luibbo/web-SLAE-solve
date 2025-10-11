import numpy as np
from utility import generate_matrix

generate_matrix(100)

try:
    matrix = np.loadtxt('matrix.txt', dtype=int) # Use dtype=int for integer matrix
    print(matrix)
except FileNotFoundError:
    print("Error: 'matrix.txt' not found.")
except ValueError:
    print("Error: Data in 'matrix.txt' is not compatible with specified dtype or delimiter.")