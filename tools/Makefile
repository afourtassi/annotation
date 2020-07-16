# Makefile CRE2015
CC = gcc
CPP = g++
LIB = -lm
OPTION = -I.

EXEC: make_json_list_files make_json_done clean_json stat_json

all: $(EXEC)

make_json_list_files: make_json_list_files.c
	$(CC) -o make_json_list_files make_json_list_files.c -I.

make_json_done: make_json_done.c check_gold.o
	$(CC) -o make_json_done make_json_done.c check_gold.o -I.

stat_json: stat_json.c check_gold.o
	$(CC) -o stat_json stat_json.c check_gold.o -I.

check_gold.o: check_gold.c check_gold.h
	$(CC) -c check_gold.c

clean_json: clean_json.c
	$(CC) -o clean_json clean_json.c
 
clean:
	rm -f $(EXEC)
	rm -f ./check_gold.o

 
