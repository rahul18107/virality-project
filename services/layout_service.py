import math
import random


def generate_positions(count, x_range=(100, 900), y_range=(100, 600), jitter=0.6):
    """Return `count` (x, y) points spread across the canvas without overlapping.

    Instead of sampling each point independently (which clusters), the canvas is
    split into a grid with at least `count` cells. One point goes in each of
    `count` randomly chosen cells, jittered inside the middle `jitter` fraction
    of its cell, so any two points stay at least (1 - jitter) * cell_size apart.
    """
    if count <= 0:
        return []

    x_min, x_max = x_range
    y_min, y_max = y_range
    width = x_max - x_min
    height = y_max - y_min

    # aspect-aware grid so cells stay roughly square
    cols = max(1, round(math.sqrt(count * width / height)))
    rows = math.ceil(count / cols)
    # widen the grid if rounding left us short on cells
    while cols * rows < count:
        cols += 1

    cell_w = width / cols
    cell_h = height / rows
    margin_x = cell_w * (1 - jitter) / 2
    margin_y = cell_h * (1 - jitter) / 2

    cells = random.sample([(c, r) for r in range(rows) for c in range(cols)], count)

    positions = []
    for col, row in cells:
        x = x_min + col * cell_w + margin_x + random.random() * cell_w * jitter
        y = y_min + row * cell_h + margin_y + random.random() * cell_h * jitter
        positions.append((round(x), round(y)))

    return positions
