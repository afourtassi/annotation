/*  Take a list of JSON files and output stat  */
/*  FRED 0317 + 1117  */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <check_gold.h>

/*................................................................*/

#define TailleLigne     8000

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
int nbannot,nbgold,i,j;

nbannot=nbgold=0;
while (fgets(ch,TailleLigne,stdin)) if (ch[0]!='\n')
 {
 strtok(ch,"\n");
 i=j=0;
 stat_json(ch,&i,&j,False);
 nbannot+=i; nbgold+=j;
 }
printf("Nombre d'annotation à faire : %d  - nombre d'annotation faites : %d (%.2lf%%)\n",nbannot,nbgold,(double)(nbgold*100)/(double)nbannot);
exit(0);
}
 
