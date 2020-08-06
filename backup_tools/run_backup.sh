#!/bin/bash
TIME=`date +%b-%d-%y`                      # This Command will read the date.
FILENAME=backup-paris-$TIME.tar.gz    # The filename including the date.
SRCDIR=./data                              # Source backup folder.
DESDIR=./backup                             # Destination of backup file.
tar -cpzf $DESDIR/$FILENAME $SRCDIR