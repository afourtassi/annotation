#!/bin/sh

CORPUS_TMP="corpus_tmp/"
DATA_ROOT="data/"

if [ -d $CORPUS_TMP ]
then
    echo "$CORPUS_TMP already existed."
else
    echo "$CORPUS_TMP not found, make new dir."
    mkdir "$CORPUS_TMP"
fi

if [ -d $DATA_ROOT ]
then
    echo "$DATA_ROOT already existed."
else
    echo "$DATA_ROOT not found, make new dir."
    mkdir "$DATA_ROOT"
fi

if [ -e "$CORPUS_TMP/chatter.jar" ]
then
    echo "CHATTER already prepared, no need to downlaod."
else
    echo "CHATTER not found, start downloading."
    wget -P $CORPUS_TMP https://talkbank.org/software/chatter.jar
fi

if [ "$#" -eq 1 ]
then
    if [ ! -d "$DATA_ROOT/$1" ]
    then
        if [ ! -e "$CORPUS_TMP/$1.zip" ]
        then
            if [ $1 == "Lyon" ] || [ $1 == "Paris" ] || [ $1 == "Yamaguchi" ]
            then
                echo "Downloading: https://phonbank.talkbank.org/data/French/$1.zip"
                wget -P "$CORPUS_TMP/" "https://phonbank.talkbank.org/data/French/$1.zip"
            elif [ $1 == "York" ]
            then
                echo "Downloading: https://childes.talkbank.org/data/French/$1.zip"
                wget -P "$CORPUS_TMP/" "https://childes.talkbank.org/data/French/$1.zip"
            else
                echo "Need to add new Corpus!"
            fi
        fi
        if [ ! -d "$CORPUS_TMP/$1-xml" ]
        then
            unzip "$CORPUS_TMP/$1.zip" -d "$CORPUS_TMP"
            java -cp "$CORPUS_TMP/chatter.jar" org.talkbank.chatter.App --inputFormat cha --outputFormat xml --outputDir "$CORPUS_TMP/$1-xml" -tree "$CORPUS_TMP/$1"
        fi
        python3 preprocess/process_xml.py "$CORPUS_TMP/$1-xml" "$DATA_ROOT" "$1"
    else
        echo "Corpus $1 has been processed."
    fi
    ./tools/update_list_file.sh "$DATA_ROOT"
    echo ""
    echo "Preprocessing for $1 completed!"
else
    echo "Please provide Corpus! For example, 'Paris'."
    exit
fi