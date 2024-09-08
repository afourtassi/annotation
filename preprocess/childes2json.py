import requests, zipfile, io
import json
import os
from xml.etree.ElementTree import parse, fromstring, ElementTree

from parser import translate_to_json


for corpus in [
  "Champaud",
  "Geneva",
  "Hammelrath",
  "Leveille",
  "MTLN",
  "Palasis",
  "Pauline",
  "VionColas",
  "York",
]:
  xml_files = os.listdir(f"./data/{corpus}")
  print(xml_files)
  for xml_file in xml_files:
    xml_string = open(f"./data/Champaud/{xml_file}", "r").read()
    name = xml_file.replace(".xml", ".json")
    doc = ElementTree(fromstring(xml_string))
    doc_json = translate_to_json(doc, name)
    with open(f"./data/Champaud/{name}", "w") as f:
      json.dump(doc_json, f, indent=2)
    print(f"./data/Champaud/{name}")
