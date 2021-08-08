from pathlib import Path
import math

from utils import *

root = Path(__file__).parents[1]
dataroot = root / 'data'
input_file = dataroot / 'raw/emission.csv'
output_file = dataroot / 'processed/emission.csv'

table = load_csv(input_file)

# stack yearly records into a single column 'emission'
year_columns = [str(y) for y in range(1990,2019)]
table = stack(table, year_columns, 'year', 'emission')

# remove unnecessary columns
keep_columns = ['Country','Unit','year','emission']
table = filter_columns(lambda c: c in keep_columns)(table)

# remove the 'World' rows, leaving only country data
table = filter_rows(lambda r: r[0]!='World')(table)

# process nans
def zero_nans(datum):
    if datum=='N/A':
        return '0'
    else:
        return datum
emission = transform('emission',zero_nans)(table)

# group by region
region = load_csv(dataroot / 'raw/region.csv')
joined = join(emission,region,on=['Country'])

# # check for missing countries
# countries = {
#     'before': set(get_column('Country')(emission)),
#     'after': set(get_column('Country')(joined))
# }
# missing_countries = countries['before']-countries['after']
# if missing_countries:
#     region_countries = list(set(get_column('Country')(region)))
#     best_match = lambda country: min(region_countries,key=lambda c: leven(c,country))
#     breakpoint()

summation = lambda data: str(sum([float(d) for d in data]))
agg = aggregate('emission',summation,group_by=['Region','year'])(joined)
agg = rename_column('Region','region')(agg)

save_csv(agg, output_file)