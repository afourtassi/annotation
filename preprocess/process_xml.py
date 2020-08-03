import os
from os import system
import sys
import json
from parser import translate_to_json
from threading import main_thread
from xml.etree.ElementTree import parse, fromstring, ElementTree


if __name__ == "__main__":
    assert len(sys.argv) == 4 and sys.argv[0].endswith('.py')
    input_dir = sys.argv[1]     # 'corpus/Paris-xml'
    data_root = sys.argv[2]     # 'data'
    output_dir = sys.argv[3]    # 'Paris'

    if output_dir == 'Yamaguchi':
        if not os.path.exists(os.path.join(data_root, output_dir)):
            os.makedirs(os.path.join(data_root, output_dir))
        for filename in os.listdir(os.path.join(input_dir)):
            doc = parse(os.path.join(input_dir, filename))
            filename = os.path.join(output_dir, filename.replace('.xml', '.json'))
            d = translate_to_json(doc, filename)
            with open(os.path.join(data_root, filename), 'w') as f:
                json.dump(d, f, indent=4)
    else:
        for sub_path in os.listdir(input_dir):
            if not os.path.exists(os.path.join(data_root, output_dir, sub_path)):
                os.makedirs(os.path.join(data_root, output_dir, sub_path))
            for filename in os.listdir(os.path.join(input_dir, sub_path)):
                doc = parse(os.path.join(input_dir, sub_path, filename))
                filename = os.path.join(output_dir, sub_path, filename.replace('.xml', '.json'))
                d = translate_to_json(doc, filename)
                with open(os.path.join(data_root, filename), 'w') as f:
                    json.dump(d, f, indent=4)
