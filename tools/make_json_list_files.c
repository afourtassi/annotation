/*  Take a list of JSON files and build the different json files for annotation interface  */
/*  FRED 0317  */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
//#include <check_gold.h>

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

/* format
./temp/besides/sf0601.json
./temp/a/sf0013.json
./temp/down/sf0754.json
./temp/down/sf0740.json
./temp/down/sf0755.json
./temp/down/sf0735.json
./temp/down/sf0749.json
./temp/down/sf0742.json

- field 1 : generic data directory = temp
- field 2 : first level of choice (besides,a,down,etc.)
- field 3-n : following levels of choice, eventually empty
- field n+1 : last level = JSON files
*/

#define MAX_FIELD	60

typedef struct ty_file
	{
	char *name,done;
	FILE *file;
	struct ty_file *next,*down;
	} type_file;

type_file *new_file(char *name, char done)
{
type_file *pt;
pt=(type_file*)malloc(sizeof(type_file));
pt->name=strdup(name);
pt->done=done;
pt->file=NULL;
pt->next=NULL;
pt->down=NULL;
return pt;
}

type_file *add_file(type_file *head, char *name, char done)
{
type_file *pt,*ptback;
if (head==NULL) return new_file(name,done);
for(ptback=NULL,pt=head;(pt)&&(strcmp(pt->name,name));pt=pt->next) ptback=pt;
if (!pt) pt=ptback->next=new_file(name,done);
return pt;
}

type_file *add_json_file(type_file *head, char *t_field[MAX_FIELD], char done)
{
int i;
type_file *pt;
if (head==NULL) head=new_file(t_field[0],0);
for(pt=head,i=0;t_field[i];i++,pt=pt->down)
 {
 pt=add_file(pt,t_field[i],t_field[i+1]?0:done);
 if ((t_field[i+1])&&(pt->down==NULL)) pt->down=new_file(t_field[i+1],t_field[i+2]?0:done);
 }
return head;
}

void test_done(type_file *pt)
{
if (pt)
 {
 if (pt->done) printf("%s=done\n",pt->name);
 test_done(pt->down);
 test_done(pt->next);
 }
}

void nb_file2(type_file *pt, int *nb)
{
while (pt)
 {
 //printf("%s ",pt->name);
 if (!pt->down) (*nb)++;
 if (pt->down) nb_file2(pt->down,nb);// else printf("\n");
 
 pt=pt->next;
 }
}

int nb_file(type_file *pt)
{
int nb=0;
nb_file2(pt,&nb);
return nb;
}

void nb_file_done2(type_file *pt, int *nb)
{
while (pt)
 {
 if ((!pt->down)&&(pt->done)) (*nb)++;
 if (pt->down) nb_file_done2(pt->down,nb);
 pt=pt->next;
 }
}

int nb_file_done(type_file *pt)
{
int nb=0;
nb_file_done2(pt,&nb);
return nb;
}

void fprintf_json(FILE *file, type_file *head, int indice, char *chprefix, int level)
{
int i,nbid,newindice,nbex,nbok,perf;
float prec;
FILE *newfile;
static char ch[TailleLigne];

fprintf(file,"{\"level\":%d,\"last\":%d,",level,head->down?0:1);
fprintf(file,"\"data\": [");
for(nbid=0;head;head=head->next,nbid++)
 {
 sprintf(chprefix+indice,"/%s",head->name); newindice=strlen(chprefix);
 if (nbid>0) fprintf(file,",");
 perf=False;
 if (head->down)
  {
  sprintf(ch,"%s/perf.txt",chprefix);
  if (newfile=fopen(ch,"rt"))
   {
   fgets(ch,TailleLigne,newfile);
   if (sscanf(ch,"%d %d %f",&nbex,&nbok,&prec)==3) perf=True;
   fclose(newfile);
   }
  fprintf(file,"{\"name\":\"%s\",\"json\":\"%s/list_file.json\",\"nb\":%d,\"nbdone\":%d",head->name,chprefix,nb_file(head->down),nb_file_done(head->down));
  if (perf) fprintf(file,",\"nbex\":%d,\"nbok\":%d,\"prec\":\"%.1f\"",nbex,nbok,prec);
  fprintf(file,"}");
  sprintf(ch,"%s/list_file.json",chprefix);
  if (!(newfile=fopen(ch,"wt"))) ERREUR("can't write in:",ch); //else fprintf(stderr,"- ouverture : %s\n",ch);
  fprintf_json(newfile,head->down,newindice,chprefix, level+1);
  fclose(newfile);
  }
 else fprintf(file,"{\"name\":\"%s\",\"json\":\"%s\",\"nb\":1,\"nbdone\":%d}",head->name,chprefix,head->done);
 }
fprintf(file,"]}");
}

/*................................................................*/


int main(int argc, char **argv)
{
int nb,deca,done,level;
char ch[TailleLigne],*t_field[MAX_FIELD],chprefix[TailleLigne],chtmp[TailleLigne];
type_file *head;
FILE *file;

chprefix[0]='\0';
if (argc>1)
 for(nb=1;nb<argc;nb++)
  if (!strcmp(argv[nb],"-prefix"))
   {
   if (nb+1==argc) ERREUR("must have a value after argument;",argv[nb]);
   //if (!(file=fopen(argv[++nb],"rt"))) ERREUR("can't open:",argv[nb]);
   strcpy(chprefix,argv[++nb]);
   }
  else
  if (!strcmp(argv[nb],"-h"))
   {
   fprintf(stderr,"Syntax: %s [-h] -prefix <string>\n",argv[0]);
   exit(0);
   }
  else ERREUR("unknown option:",argv[nb]);

if (!chprefix[0]) ERREUR("bad syntax, check '-h'","");

head=NULL;
while (fgets(ch,TailleLigne,stdin)) if (ch[0]!='\n')
 {
 strtok(ch,"\n");
 //if (check_gold_json(ch,False)) done=1; else done=0; too slow !! back to the done files
 sprintf(chtmp,"%s.done",ch);
 if (file=fopen(chtmp,"rt")) { done=1; fclose(file); } else done=0; 
 if (!strncmp(ch,"./",2)) deca=2; else deca=0;
 for (nb=1,t_field[0]=strtok(ch+2,"/");(nb<MAX_FIELD)&&(t_field[nb-1]);nb++) t_field[nb]=strtok(NULL,"/");
 level=nb-1;
 if (nb==MAX_FIELD) ERREUR("cste MAX_FIELD too small","");
 head=add_json_file(head,t_field,done);
 }
fprintf(stdout,"NB=%d  NBDONE=%d\n",nb_file(head),nb_file_done(head));
sprintf(chtmp,"%s/list_file.json",chprefix);
if (!(file=fopen(chtmp,"wt"))) ERREUR("can't write in:",chtmp); //else fprintf(stderr,"- ouverture : %s\n",chtmp);
fprintf_json(file,head,strlen(chprefix),chprefix,0);
fclose(file);

exit(0);
}
  
