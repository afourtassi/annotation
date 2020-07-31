import os
import sys
import json
from parser import translate_to_json
from xml.etree.ElementTree import parse, fromstring, ElementTree


input_dir = 'corpus/Paris-xml'
data_root = 'data'
output_dir = 'Paris'

for sub_path in os.listdir(input_dir):
    if not os.path.exists(os.path.join(data_root, output_dir, sub_path)):
        os.makedirs(os.path.join(data_root, output_dir, sub_path))
    for filename in os.listdir(os.path.join(input_dir, sub_path)):
        doc = parse(os.path.join(input_dir, sub_path, filename))
        # print(sub_path)
        # print(filename)
        filename = os.path.join(output_dir, sub_path, filename.replace('.xml', '.json'))
        d = translate_to_json(doc, filename)
        with open(os.path.join(data_root, filename), 'w') as f:
            json.dump(d, f, indent=4)
        break
    break