import random

def generate_random_floats(n, range_start, range_end):
    ''' Generates n random floating point numbers in given range. '''
    random_floats = [
        random.uniform(range_start, range_end) 
        for _ in range(n)
    ]
    return random_floats