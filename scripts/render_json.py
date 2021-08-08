from pathlib import Path
import json

from utils import *

root = Path(__file__).parents[1]
joined = order_by('year')(load_csv(root / 'data/processed/joined-region.csv'))

outfile = root / 'src/json/data.json'

def get(column):
    return get_column(column)(joined)

data = []
regions = ['North America','Oceania','Europe','Middle East & North Africa','South America','Central America & Caribbean','Asia','Sub-Saharan Africa']
for region in regions:
    ordered = filter_rows(lambda r: r[0]==region)(joined)
    data.append({
        'region': region,
        'emission': get_column('emission')(ordered),
        'population': get_column('population')(ordered)
    })

with open(outfile,'w') as f:
    json.dump(data, f)