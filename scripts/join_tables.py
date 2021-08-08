import csv
from pathlib import Path
from utils import *
import logging

logging.basicConfig(level=logging.INFO)

root = Path(__file__).parents[1]
dataroot = root / 'data/processed'
emission_file = dataroot / 'emission.csv'
population_file = dataroot / 'population.csv'

# get tables
emission = load_csv(emission_file)
population = load_csv(population_file)

# merge data by country and year
logging.info('Merging emission and population data on (country,year)...')
joined = join(emission,population,on=['country','year'])
joined = remove_duplicate_columns(joined)

# save per-country
save_csv(joined, dataroot / 'joined-country.csv')

# merge in region
logging.info('Merging in region info...')
region = load_csv(root / 'data/raw/region.csv')
joined = join(joined,region,on=['country'])
joined = remove_duplicate_columns(joined)

# sum within each region
logging.info('Aggregating intra-region data...')
summation = lambda data: str(sum([float(d) for d in data]))
summed = aggregate(['emission','population'],summation,group_by=['region','year'])(joined)

# cleanup float point data
summed = transform('emission',lambda e: str(round(float(e),3)))(summed)
summed = transform('population',lambda e: str(round(float(e),3)))(summed)

save_csv(summed, dataroot / 'joined-region.csv')