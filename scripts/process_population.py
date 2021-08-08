import csv
from pathlib import Path
import math

from utils import *

root = Path(__file__).parents[1]
dataroot = root / 'data'
input_file = dataroot / 'raw/population.csv'
output_file = dataroot / 'processed/population.csv'

# filter out years and mathematical models
table = load_csv(input_file)
def keep_row(row):
    if row[2]!='2': # model variant: "Medium"
        return False
    year = int(row[4])
    if (year<1990) or (year>2018):
        return False
    return True
table = filter_rows(keep_row)(table)

def keep_column(column):
    return column in ['Location','Time','PopTotal']
table = filter_columns(keep_column)(table)

table = rename_column('Location','country')(table)
table = rename_column('Time','year')(table)
table = rename_column('PopTotal','population')(table)

# map official state name to country names where different

names_table = load_csv(dataroot / 'raw/alternate_country_names.csv')
alternates = get_column('alternate')(names_table)
standards = get_column('standard')(names_table)

mapping = {alt:std for (alt,std) in zip(alternates, standards)}

def map_to_standard(country):
    if country in mapping:
        return mapping[country]
    return country

population = transform('country',map_to_standard)(table)

# filter to only countries in the region map csv (e.g. things like "Africa Group" are filtered out)
region = load_csv(dataroot / 'raw/region.csv')
countries = list(set(get_column('country')(region)))
population = filter_rows(lambda r: r[0] in countries)(population)

# # check for missing countries
# countries = {
#     'before': set(get_column('Country')(region)),
#     'after': set(get_column('Country')(joined))
# }
# missing_countries = countries['before']-countries['after']
# if missing_countries:
#     pop_countries = list(set(get_column('Country')(population)))
#     best_match = lambda country: min(pop_countries,key=lambda c: leven(c,country))
#     breakpoint()
# summation = lambda data: str(sum([int(d) for d in data]))
# agg = aggregate('population',summation,group_by=['Region','year'])(joined)
# agg = rename_column('Region','region')(agg)

# output data is in units 1000s of people
save_csv(population, output_file)