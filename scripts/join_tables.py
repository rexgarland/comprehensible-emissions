import csv
from pathlib import Path
from utils import *

root = Path(__file__).parents[1]
dataroot = root / 'data/processed'
emission_file = dataroot / 'emission.csv'
population_file = dataroot / 'population.csv'
output_file = dataroot / 'joined.csv'

# get tables
emission = load_csv(emission_file)
population = load_csv(population_file)

# merge
joined = join(emission,population,on=['region','year'])
joined = remove_duplicate_columns(joined)
joined = transform('emission',lambda e: str(round(float(e),3)))(joined)

save_csv(joined, output_file)