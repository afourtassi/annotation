import requests, zipfile, io
import json
import os
from xml.etree.ElementTree import parse, fromstring, ElementTree

from parser import translate_to_json


file_list = [
    'Champaud.zip',
    'Geneva.zip',
    'Hammelrath.zip',
    'Leveille.zip',
    'MTLN.zip',
    'Palasis.zip',
    'Pauline.zip',
    'VionColas.zip',
    'York.zip'
    ]

loc = '{http://www.talkbank.org/ns/talkbank}'

for zip_file in file_list:
    zip_file_url = f'https://childes.talkbank.org/data-xml/French/{zip_file}'
    r = requests.get(zip_file_url)
    z = zipfile.ZipFile(io.BytesIO(r.content))

    for xml_name in z.namelist():
        xml_string = z.read(xml_name)
        name = xml_name.replace('.xml', '.json')
        basename, filename = os.path.split(name)
        print(basename, filename)
        doc = ElementTree(fromstring(xml_string))
        doc_json = translate_to_json(doc, name)
        if not os.path.exists(os.path.join('./data/', basename)):
            os.makedirs(os.path.join('./data/', basename))
        with open(os.path.join('./data/', name), 'w') as f:
            json.dump(doc_json, f, indent=2)