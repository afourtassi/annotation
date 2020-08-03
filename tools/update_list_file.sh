#!/bin/sh
if [ "$#" -eq 1 ]; then
#  echo "Il manque l'argument : data directory"
#  exit
    find "./"$1"/" -name "*.json" -print | grep -v 'list_file.json' > tmp.listfile 
    # cat tmp.listfile | ./tools/clean_json
    cat tmp.listfile | ./tools/make_json_list_files -prefix .
fi

if [ "$#" -eq 2 ]; then
#  echo "Il manque l'argument : data directory"
#  exit
    find "./"$1"/" -name "*.json" -print | grep -v 'list_file.json' > tmp.listfile 
    cat tmp.listfile | ./tools/make_json_list_files -prefix . -author $2
fi