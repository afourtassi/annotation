#!/bin/sh
if [ "$#" -ne 1 ]; then
 echo "Il manque l'argument : data directory"
 exit
fi
find "./"$1"/" -name "*.json" -print | grep -v 'list_file.json' > tmp.listfile 
# cat tmp.listfile | ./tools/clean_json
cat tmp.listfile | ./tools/make_json_list_files -prefix . 
