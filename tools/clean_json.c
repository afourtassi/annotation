/*  Remove spaces and CR from a json file  */
/*  0917 FRED  */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

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

int clean_json(char *filename)
{
int nb,retour;
long taille;
char *buffer;
FILE *fjson;

if (!(fjson=fopen(filename,"rt"))) ERREUR("can't open:",filename);
fseek(fjson,0,SEEK_END);
taille=ftell(fjson);
buffer=(char*)malloc(sizeof(char)*(taille+1));
fseek(fjson,0,SEEK_SET);
fread(buffer,sizeof(char),taille,fjson);
buffer[taille]='\0';
fclose(fjson);

if (!(fjson=fopen(filename,"wt"))) ERREUR("can't wrtie in:",filename);
for(nb=0;nb<taille;nb++) if ((buffer[nb]!=' ')&&(buffer[nb]!='\n')) fprintf(fjson,"%c",buffer[nb]);
fclose(fjson);
free(buffer);
return retour;
}

int main(int argc, char **argv)
{
char ch[TailleLigne];
FILE *file;
while (fgets(ch,TailleLigne,stdin)) if (ch[0]!='\n')
 {
 strtok(ch,"\n");
 clean_json(ch);
 }
exit(0);
}
 
