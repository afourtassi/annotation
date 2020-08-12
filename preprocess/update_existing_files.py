#!/usr/bin/python
import os
import json
# from preprocess.annotation_list_parser import label2
# from annotation_list_parser import label2


def get_annotation_lists(src_path):
    label1_list, label2_list = ["NULL"], ["NULL"]
    flag = True
    with open(src_path, 'r') as f:
        raw_data = f.read()
        for line in raw_data.split('\n'):
            if flag:  # label1_list
                if len(line) > 0 and line[0] == '-':
                    label = line.split('(')[0][1:]
                    label1_list.append(label)
                if line.startswith('List of labels 2'):
                    flag = False
            else:  # label2_list
                if len(line) > 0 and line[0] == '-':
                    label = line.split('(')[0][1:]
                    label2_list.append(label)
    return label1_list, label2_list


label1_list, label2_list = get_annotation_lists('./preprocess/labels_list.txt')

print(label1_list, label2_list)

# traverse root directory, and list directories as dirs and files as files
for root, dirs, files in os.walk("data"):
    path = root.split(os.sep)
    # print((len(path) - 1) * '---', os.path.basename(root))
    for file_name in files:
        if 'list_file.json' in file_name:
            continue
        # print(len(path) * '---', file)
        json_path_full = os.path.join(root, file_name)
        print(json_path_full)
        with open(json_path_full, 'r', encoding='utf-8') as f:
            # print(f.read())
            data = json.load(f)
        data['header']['labels_1'] = label1_list
        data['header']['labels_2'] = label2_list
        # print(data)
        with open(json_path_full, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
