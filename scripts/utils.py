import csv

def find(value, list, assert_exists=True):
    for i in range(len(list)):
        if value==list[i]:
            return i
    if assert_exists:
        raise Exception(f'Could not find value "{value}" in list')
    return None

def load_csv(file):
    with open(file, newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [row for row in reader]
    return header, data

def save_csv(table, file):
    header, data = table
    with open(file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for row in data:
            writer.writerow(row)

def filter_columns(condition):
    def filter_func(table):
        header, data = table
        keep_indicies = [i for i in range(len(header)) if condition(header[i])]
        new_header = [header[i] for i in keep_indicies]
        new_data = []
        for row in data:
            new_data.append([row[i] for i in keep_indicies])
        return new_header, new_data
    return filter_func

def filter_rows(condition):
    def filter_func(table):
        header, data = table
        new_data = [row for row in data if condition(row)]
        return header, new_data
    return filter_func

def stack(table, columns, variable_label='stacked', value_label='value'):
    header, data = table
    column_indices = [find(c,header) for c in columns]
    new_header = [header[i] for i in range(len(header)) if not (i in column_indices)] + [variable_label, value_label]
    new_data = []
    for row in data:
        new_row = [row[i] for i in range(len(row)) if not (i in column_indices)]
        for i in column_indices:
            variable = header[i]
            datum = row[i]
            new_data.append(new_row + [variable, datum])
    return new_header, new_data

def transform(column, function):
    def mapper(table):
        header, data = table
        column_index = find(column,header)
        new_data = []
        for row in data:
            row[column_index] = function(row[column_index])
            new_data.append(row)
        return header, new_data
    return mapper

def aggregate(column, function, group_by=[]):
    def aggregator(table):
        header, data = table
        group_by_indices = [find(c,header) for c in group_by]
        column_index = find(column,header)
        new_header = group_by + [column]
        groups = {}
        for row in data:
            group = tuple([row[i] for i in group_by_indices])
            datum = row[column_index]
            if group in groups:
                groups[group].append(datum)
            else:
                groups[group] = [datum]
        new_data = []
        for group in groups:
            new_data.append(list(group)+[function(groups[group])])
        return new_header, new_data
    return aggregator

def leven(a,b):
    """Levenshtein distance between two strings"""
    diagonals = set((x,y) for x in range(len(a)) for y in range(len(b)) if a[x]==b[y])
    V = [[float('+inf') for _ in range(len(b)+1)] for _ in range(len(a)+1)]
    V[0][0] = 0
    for d in range(len(a)+len(b)):
        x = min(d,len(a))
        y = d-x
        while (x>=0) and (y<=len(b)):
            if (x,y) in diagonals:
                V[x+1][y+1] = V[x][y]
            if x<len(a):
                V[x+1][y] = min(V[x][y] + 1,V[x+1][y])
            if y<len(b):
                V[x][y+1] = min(V[x][y] + 1,V[x][y+1])
            x -= 1
            y += 1
    return V[len(a)][len(b)]

def join(t1, t2, on=[], fuzzy=False):
    h1, d1 = t1
    h2, d2 = t2
    on_indices = []
    for c in on:
        if type(c) is str:
            a,b = c,c
        else:
            a,b = c
        on_indices.append((find(a,h1),find(b,h2)))

    # compute the join matrix
    J = [[1]*len(d2) for _ in range(len(d1))]
    # for each column pair to match
    for (i1,i2) in on_indices:
        # for each combination of rows
        for x in range(len(d1)):
            for y in range(len(d2)):
                # mark as 0 if cells do not match
                if J[x][y]:
                    v1 = d1[x][i1]
                    v2 = d2[y][i2]
                    match = v1==v2
                    if not match and fuzzy:
                        match = leven(v1,v2)<5
                    J[x][y] = int(match)

    # join tables on matching rows
    new_header = h1 + h2
    new_data = []
    for x in range(len(d1)):
        for y in range(len(d2)):
            if J[x][y]:
                new_data.append(d1[x]+d2[y])
    return new_header, new_data

def get_column(column):
    def getter(table):
        header, data = table
        i = find(column,header)
        return [row[i] for row in data]
    return getter

def rename_column(before,after):
    def renamer(table):
        header, data = table
        i = find(before, header)
        header[i] = after
        return header, data
    return renamer

def remove_duplicate_columns(table):
    header, data = table
    to_keep_indices = [i for i in range(len(header)) if not (header[i] in header[:i])]
    new_header = [header[i] for i in to_keep_indices]
    new_data = [[row[i] for i in to_keep_indices] for row in data]
    return new_header, new_data

def get_columns(columns):
    def getter(table):
        return [get_column(column)(table) for column in columns]
    return getter

def order_by(column, metric=str):
    def orderer(table):
        header, data = table
        i = find(column, header)
        new_data = sorted(data, key=lambda row: metric(row[i]))
        return header, new_data
    return orderer