/*  Take a list of JSON files and build the different json files for annotation interface  */
/*  FRED 0317  */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <check_gold.h>

/*................................................................*/

#define TailleLigne     20000

#define True    1
#define False   0

void ERREUR(char *ch1,char *ch2)
{
fprintf(stderr,"ERREUR : %s %s\n",ch1,ch2);
exit(0);
}

void ERREURd(char *ch1, int i)
{
fprintf(stderr,"ERREUR : %s %d\n",ch1,i);
exit(0);
}

/*................................................................*/

int main(int argc, char **argv)
{
char ch[TailleLigne],chtmp[TailleLigne];
FILE *file;

while (fgets(ch,TailleLigne,stdin)) if (ch[0]!='\n')
 {
 strtok(ch,"\n");
 fprintf(stderr,"fichier %s ",ch);
 if (check_gold_json(ch,False))
  {
  fprintf(stderr,"= DONE\n");
 
  /*
  sprintf(chtmp,"%s.done",ch);
  if (!(file=fopen(chtmp,"wt"))) ERREUR("can't write in:",chtmp);
  fprintf(file,"DONE\n",file);
  fclose(file);
  */
  }
 else fprintf(stderr,"= NOT DONE\n");
 }

exit(0);
}
 
