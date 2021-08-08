import csv
from pathlib import Path
import math

from utils import *

root = Path(__file__).parents[1]
dataroot = root / 'data'
input_file = dataroot / 'raw/population.csv'
output_file = dataroot / 'processed/population.csv'

# keep_columns = [
#     ('Location','location'),
#     ('Time','year'),
#     ('PopTotal','population')
# ]

# def map_columns(header, data, column_map):
#     order = []
#     new_header = []
#     for (a,b) in column_map:
#         i = find(a,header)
#         order.append(i)
#         new_header.append(b)
#     new_data = []
#     for row in data:
#         new_data.append([row[i] for i in order])
#     return new_header, new_data

# # load the data
# with open(input_file, newline='') as f:
#     reader = csv.reader(f)
#     header = next(reader)

#     finished = set()

#     # filter by appropriate years
#     iyear = find('Time',header)
#     ipop = find('PopTotal',header)
#     ivar = find('VarID',header)
#     iloc = find('Location',header)
#     data = []
#     lastLocation = ''
#     for row in reader:
#         year = float(row[iyear])
#         varid = int(row[ivar])
#         location = row[iloc]
#         if varid==2 and (not (location in finished)) and year>=1990 and year<=2018:
#             pop = float(row[ipop])
#             row[ipop] = str(math.floor(pop*1000))
#             data.append(row)
#             # keep track of completed countries
#             if location!=lastLocation:
#                 finished.add(lastLocation)
#                 lastLocation = location

# population = map_columns(header, data, keep_columns)

table = load_csv(input_file)
def keep_row(row):
    if row[2]!='2':
        return False
    year = int(row[4])
    if (year<1990) or (year>2018):
        return False
    return True
table = filter_rows(keep_row)(table)

def keep_column(column):
    return column in ['Location','Time','PopTotal']
table = filter_columns(keep_column)(table)

table = rename_column('Location','Country')(table)
table = rename_column('Time','year')(table)
table = rename_column('PopTotal','population')(table)
table = transform('population',lambda p: str(int(float(p)*1000)))(table)

names_table = load_csv(dataroot / 'raw/alternate_country_names.csv')
alternates = get_column('alternate')(names_table)
standards = get_column('standard')(names_table)

mapping = {alt:std for (alt,std) in zip(alternates, standards)}

def map_to_standard(country):
    if country in mapping:
        return mapping[country]
    return country

population = transform('Country',map_to_standard)(table)

# merge with region
region = load_csv(dataroot / 'raw/region.csv')
joined = join(population,region,on=['Country'])

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
summation = lambda data: str(sum([int(d) for d in data]))
agg = aggregate('population',summation,group_by=['Region','year'])(joined)
agg = rename_column('Region','region')(agg)

save_csv(agg, output_file)