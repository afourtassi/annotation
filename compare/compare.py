import json
import sys
import os
import argparse
import xlwt


CONST_0 = 0
CONST_1 = 1
CONST_2 = 2
CONST_3 = 3

CURRENT_ROW = 1


def fix_annotations(annotation1, annotation2):
    if annotation1['type'] != 'utterance':
        return False
    if 'label_1_c' not in annotation1:
        annotation1['label_1_c'] = '---'
    if 'label_2_c' not in annotation1:
        annotation1['label_2_c'] = '---'
    if 'label_1_c' not in annotation2:
        annotation2['label_1_c'] = '---'
    if 'label_2_c' not in annotation2:
        annotation2['label_2_c'] = '---'
        # print([annotation2['label_2_a'], annotation2['label_2_b'], annotation2['label_2_c']])


def compare_annotations(annotation1, annotation2):
    if annotation1['type'] != 'utterance':
        return False
    annotation1_set1 = set([annotation1['label_1_a'], annotation1['label_1_b'], annotation1['label_1_c'] if annotation1['label_1_c'] != '---' else 'NULL'])
    annotation1_set2 = set([annotation1['label_2_a'], annotation1['label_2_b'], annotation1['label_2_c'] if annotation1['label_2_c'] != '---' else 'NULL'])
    annotation2_set1 = set([annotation2['label_1_a'], annotation2['label_1_b'], annotation2['label_1_c'] if annotation2['label_1_c'] != '---' else 'NULL'])
    annotation2_set2 = set([annotation2['label_2_a'], annotation2['label_2_b'], annotation2['label_2_c'] if annotation2['label_2_c'] != '---' else 'NULL'])
    # if '---' in [annotation2['label_1_a'], annotation2['label_1_b'], annotation2['label_1_c']]:
    #     print([annotation2['label_1_a'], annotation2['label_1_b'], annotation2['label_1_c']], annotation1_set1, annotation2_set1, annotation1_set1 == annotation2_set1)
    return annotation1_set1 == annotation2_set1 and annotation1_set2 == annotation2_set2


parser = argparse.ArgumentParser(description='Compare between annotations.')

# parser.add_argument('--verbose', action='store_true', help='dump verbosely')
parser.add_argument('--path', type=str, required=True, help="path-to-data, like 'data/demo.json'")
parser.add_argument('--author1', type=str, default='charlie', help="name of author 1, default 'charlie'")
parser.add_argument('--author2', type=str, default='morgane', help="name of author 2, default 'morgane'")

args = parser.parse_args()
args.verbose = True  # force verbose

print(vars(args))

book = xlwt.Workbook(style_compression=2)
sheet1 = book.add_sheet('Sheet 1')

sheet1.col(CONST_0).width = 256 * 20
sheet1.col(CONST_1).width = 256 * 60
sheet1.col(CONST_2).width = 256 * 60
sheet1.col(CONST_3).width = 256 * 60

STYLE1 = xlwt.easyxf('pattern: pattern solid; borders: left thin, right thin, top thin, bottom thin;')
STYLE1.pattern.pattern_fore_colour = 1
STYLE2 = xlwt.easyxf('pattern: pattern solid; borders: left thin, right thin, top thin, bottom thin;')
STYLE2.pattern.pattern_fore_colour = 49
STYLE3 = xlwt.easyxf('pattern: pattern solid; borders: left thin, right thin, top thin, bottom thin;')
STYLE3.pattern.pattern_fore_colour = 51

sheet1.write(0, CONST_2, args.author1, xlwt.easyxf(''))
sheet1.write(0, CONST_3, args.author2, xlwt.easyxf(''))

annotation_path_1 = args.path + '.' + args.author1
annotation_path_2 = args.path + '.' + args.author2

if not os.path.isfile(annotation_path_1):
    raise FileNotFoundError(annotation_path_1)

if not os.path.isfile(annotation_path_2):
    raise FileNotFoundError(annotation_path_2)

with open(annotation_path_1, 'r') as f:
    annotation_data_1 = json.load(f)

with open(annotation_path_2, 'r') as f:
    annotation_data_2 = json.load(f)

annotation_comparison_1 = {'header': annotation_data_1['header'], 'documents': []}
annotation_comparison_2 = {'header': annotation_data_2['header'], 'documents': []}

del annotation_comparison_1['header']['labels_1']
del annotation_comparison_1['header']['labels_2']

del annotation_comparison_2['header']['labels_1']
del annotation_comparison_2['header']['labels_2']

for i, (annotation_1_i, annotation_2_i) in enumerate(zip(annotation_data_1['documents'], annotation_data_2['documents'])):
    fix_annotations(annotation_1_i, annotation_2_i)
    sheet1.write(CURRENT_ROW, CONST_0, f'Number: {i}', xlwt.easyxf(''))
    sheet1.write(CURRENT_ROW, CONST_1, f'Type: {annotation_1_i["type"]}', xlwt.easyxf('borders: left thick, top thick, right thick; align: wrap on;'))
    if annotation_1_i['type'] == 'utterance':
        sheet1.write(CURRENT_ROW+1, CONST_1, f'Speaker: {annotation_1_i["subject"]}', xlwt.easyxf('borders: right thick, left thick; align: wrap on;'))
        sheet1.write(CURRENT_ROW+2, CONST_1, f'Utterance: {annotation_1_i["turn"]}', xlwt.easyxf('borders: left thick, right thick; align: wrap on;'))
        sheet1.write(CURRENT_ROW+3, CONST_1, f'Explanation: {annotation_1_i["explanation"]}', xlwt.easyxf('borders: left thick, bottom thick, right thick; align: wrap on;'))
    else:
        # sheet1.write(CURRENT_ROW+1, CONST_1, f'Speaker: {annotation_1_i["subject"]}', xlwt.easyxf('borders: top thick, bottom thick, left thick;'))
        sheet1.write(CURRENT_ROW+1, CONST_1, f'Utterance: {annotation_1_i["turn"]}', xlwt.easyxf('borders: left thick, right thick; align: wrap on;'))
        sheet1.write(CURRENT_ROW+2, CONST_1, f'Explanation: {annotation_1_i["explanation"]}', xlwt.easyxf('borders: left thick, bottom thick, right thick; align: wrap on;'))


    if compare_annotations(annotation_1_i, annotation_2_i):  # same annotation!
        if args.verbose:
            annotation_comparison_1['documents'].append(annotation_1_i)
            annotation_comparison_1['documents'][-1]['NUMBER'] = i
            annotation_comparison_2['documents'].append(annotation_2_i)
            annotation_comparison_2['documents'][-1]['NUMBER'] = i

            sheet1.write(CURRENT_ROW, CONST_2, annotation_1_i['label_1_a'], STYLE1) 
            sheet1.write(CURRENT_ROW+1, CONST_2, annotation_1_i['label_1_b'], STYLE1) 
            sheet1.write(CURRENT_ROW+2, CONST_2, annotation_1_i['label_1_c'], STYLE1) 
            sheet1.write(CURRENT_ROW+3, CONST_2, annotation_1_i['label_2_a'], STYLE1) 
            sheet1.write(CURRENT_ROW+4, CONST_2, annotation_1_i['label_2_b'], STYLE1)
            sheet1.write(CURRENT_ROW+5, CONST_2, annotation_1_i['label_2_c'], STYLE1)

            sheet1.write(CURRENT_ROW, CONST_3, annotation_2_i['label_1_a'], STYLE1) 
            sheet1.write(CURRENT_ROW+1, CONST_3, annotation_2_i['label_1_b'], STYLE1) 
            sheet1.write(CURRENT_ROW+2, CONST_3, annotation_2_i['label_1_c'], STYLE1) 
            sheet1.write(CURRENT_ROW+3, CONST_3, annotation_2_i['label_2_a'], STYLE1) 
            sheet1.write(CURRENT_ROW+4, CONST_3, annotation_2_i['label_2_b'], STYLE1)
            sheet1.write(CURRENT_ROW+5, CONST_3, annotation_2_i['label_2_c'], STYLE1)
            CURRENT_ROW += 6
        else:
            CURRENT_ROW += 1
    else:  # Different annotations, or Comments
        if annotation_1_i['type'] == 'utterance':
            annotation_comparison_1['documents'].append(annotation_1_i)
            del annotation_comparison_1['documents'][-1]["status_seg"]
            del annotation_comparison_1['documents'][-1]["status_lab"]
            # del annotation_comparison_1['documents'][-1]["timestamp"]
            # del annotation_comparison_1['documents'][-1]["author"]
            annotation_comparison_1['documents'][-1]['NUMBER'] = i
            annotation_comparison_1['documents'][-1][args.author2] = {
                'label_1_a': annotation_2_i['label_1_a'], 
                'label_1_b': annotation_2_i['label_1_b'], 
                'label_2_a': annotation_2_i['label_2_a'], 
                'label_2_b': annotation_2_i['label_2_b']  # TODO:
                }

            annotation_comparison_2['documents'].append(annotation_2_i)
            del annotation_comparison_2['documents'][-1]["status_seg"]
            del annotation_comparison_2['documents'][-1]["status_lab"]
            # del annotation_comparison_2['documents'][-1]["timestamp"]
            # del annotation_comparison_2['documents'][-1]["author"]
            annotation_comparison_2['documents'][-1]['NUMBER'] = i
            annotation_comparison_2['documents'][-1][args.author1] = {
                'label_1_a': annotation_1_i['label_1_a'], 
                'label_1_b': annotation_1_i['label_1_b'], 
                'label_2_a': annotation_1_i['label_2_a'], 
                'label_2_b': annotation_1_i['label_2_b']
                }

            sheet1.write(CURRENT_ROW, CONST_2, annotation_1_i['label_1_a'], STYLE2) 
            sheet1.write(CURRENT_ROW+1, CONST_2, annotation_1_i['label_1_b'], STYLE2) 
            sheet1.write(CURRENT_ROW+2, CONST_2, annotation_1_i['label_1_c'], STYLE2) 
            sheet1.write(CURRENT_ROW+3, CONST_2, annotation_1_i['label_2_a'], STYLE2) 
            sheet1.write(CURRENT_ROW+4, CONST_2, annotation_1_i['label_2_b'], STYLE2)
            sheet1.write(CURRENT_ROW+5, CONST_2, annotation_1_i['label_2_c'], STYLE2)

            sheet1.write(CURRENT_ROW, CONST_3, annotation_2_i['label_1_a'], STYLE3)
            sheet1.write(CURRENT_ROW+1, CONST_3, annotation_2_i['label_1_b'], STYLE3) 
            sheet1.write(CURRENT_ROW+2, CONST_3, annotation_2_i['label_1_c'], STYLE3) 
            sheet1.write(CURRENT_ROW+3, CONST_3, annotation_2_i['label_2_a'], STYLE3) 
            sheet1.write(CURRENT_ROW+4, CONST_3, annotation_2_i['label_2_b'], STYLE3)
            sheet1.write(CURRENT_ROW+5, CONST_3, annotation_2_i['label_2_c'], STYLE3)
            CURRENT_ROW += 6
        else:
            CURRENT_ROW += 6
    CURRENT_ROW += 1

# annotation_comparison_path_1 = args.path + '.comparison.' + args.author1 + '.json'
# annotation_comparison_path_2 = args.path + '.comparison.' + args.author2 + '.json'

# with open(annotation_comparison_path_1, 'w') as f:
#     json.dump(annotation_comparison_1, f, indent=2)

# with open(annotation_comparison_path_2, 'w') as f:
#     json.dump(annotation_comparison_2, f, indent=2)

xls_path = args.path + '.xls'

book.save(xls_path)
