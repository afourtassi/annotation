/*  Check if a JSON file contains just gold annotation  */
/*  FRED 0417  */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

/*................................................................*/

#define TailleLigne     8000

#define True    1
#define False   0

void ERREUR_check_gold(char *ch1,char *ch2)
{
fprintf(stderr,"ERREUR : %s %s\n",ch1,ch2);
exit(0);
}

void ERREURd_check_gold(char *ch1, int i)
{
fprintf(stderr,"ERREUR : %s %d\n",ch1,i);
exit(0);
}

/*................................................................*/

/* JSON */

/*
{"header":{"id":"above:sf0050","filename":"./data/above/sf0050.json","timestamp":"","labels_segment":["link","target","_"],"labels_link":["NULL"]},"annotation":{"name":"fredbechet","time_start":1490707574
951,"time_end":1490708892010},"documents":[{"id":"2458006588_5","tokens":[{"id":0,"word":"A","bold":0,"newline":0},{"id":1,"word":"black","bold":0,"newline":0},{"id":2,"word":"and","bold":0,"newline":0},{
"id":3,"word":"brown","bold":0,"newline":0},{"id":4,"word":"dog","bold":0,"newline":0},{"id":5,"word":"standing","bold":0,"newline":0},{"id":6,"word":"on","bold":0,"newline":0},{"id":7,"word":"a","bold":0
,"newline":0},{"id":8,"word":"beam","bold":0,"newline":0},{"id":9,"word":"above","bold":1,"newline":0},{"id":10,"word":"water","bold":0,"newline":0}
*/

typedef struct ty_json
 {
 char *chat,*chval;
 int indice;
 struct ty_json *next,*down;
 } type_json;

type_json *new_json(char *chat, char *chval, int indice)
{
type_json *pt;
pt=(type_json*)malloc(sizeof(type_json));
pt->chat=chat?strdup(chat):NULL;
pt->chval=chval?strdup(chval):NULL;
pt->indice=indice;
pt->next=pt->down=NULL;
return pt;
}

void free_json(type_json *pt)
{
if (pt) { free_json(pt->next); free_json(pt->down); free(pt); }
}

void copy_chaine(char *ch, int *nb, char *dest)
{
int i;
if (ch[*nb]=='"')
 {
 for((*nb)++,i=0;(ch[*nb])&&(ch[*nb]!='"');(*nb)++,i++) dest[i]=ch[*nb];
 if (ch[*nb]!='"') ERREUR_check_gold("bad format2 for attribute:",ch+(*nb));
 (*nb)++; dest[i]='\0';
 }
else
if ((ch[*nb]>='0')&&(ch[*nb]<='9'))
 {
 for(i=0;(ch[*nb])&&((ch[*nb]>='0')&&(ch[*nb]<='9'));(*nb)++,i++) dest[i]=ch[*nb];
 dest[i]='\0';
 }
else ERREUR_check_gold("bad format for string1:",ch+*nb);
}

type_json *parse_json(char *ch, int *nb)
{
char sepa;
static char chat[TailleLigne], chval[TailleLigne];
int i,indice;
type_json *root,*pt;

root=pt=new_json(NULL,NULL,-1);
sepa=ch[*nb];
if (sepa=='{')
 {
 for((*nb)++;(ch[*nb])&&(ch[*nb]!='}');)
  {
  if (ch[*nb]!='"') ERREUR_check_gold("bad format1 for attribute:",ch+(*nb));
  copy_chaine(ch,nb,chat);
  pt->chat=strdup(chat);
  if (ch[*nb]!=':') ERREUR_check_gold("bad format2 for attribute:",ch+(*nb));
  (*nb)++;
  if ((ch[*nb]=='{')||(ch[*nb]=='[')) pt->down=parse_json(ch,nb);
  else { copy_chaine(ch,nb,chval); pt->chval=strdup(chval); }
  if (ch[*nb]==',') { pt->next=new_json(NULL,NULL,-1); pt=pt->next; (*nb)++; }
  }
 if (ch[*nb]!='}') ERREUR_check_gold("missing '}'","");
 (*nb)++;
 }
else
if (sepa=='[')
 {
 for(i=0,(*nb)++;(ch[*nb])&&(ch[*nb]!=']');i++)
  {
  pt->indice=i;
  if ((ch[*nb]=='{')||(ch[*nb]=='[')) pt->down=parse_json(ch,nb);
  else { copy_chaine(ch,nb,chval); pt->chval=strdup(chval); }
  if (ch[*nb]==',') { pt->next=new_json(NULL,NULL,-1); pt=pt->next; (*nb)++; }
  }
 if (ch[*nb]!=']') ERREUR_check_gold("missing ']'","");
 (*nb)++;
 }
else ERREUR_check_gold("Unexpected token:",ch+*nb);
return root; 
}

type_json *find_attribute(type_json *root, char *chat)
{
type_json *pt;
for(pt=root;(pt)&&((!pt->chat)||(strcmp(chat,pt->chat)));pt=pt->next);
return pt;
}

void print_json_rec(type_json *root, int deca)
{
int i;
if (root)
 {
 for(i=0;i<deca;i++) printf(" ");
 printf("%s %s %d\n",root->chat?root->chat:"NULL",root->chval?root->chval:"NULL",root->indice);
 print_json_rec(root->down,deca+4);
 print_json_rec(root->next,deca);
 }
}

void print_json(type_json *root)
{
print_json_rec(root,0);
}

/*................................................................*/

/* format:
{"header": { "id": "before:sf1024", "filename": "temp/before/sf1024.json", "timestamp": "", "labels_segment": ["link","target","_"], "labels_link": ["NULL"] }, "annotation": { "name": "", "time_start": "", "time_end": "" }, "documents": [ {"id": "3392019836_2","tokens": [{ "id": 0, "word": "Two", "bold": 0,"newline": 0 },{ "id": 1, "word": "people", "bold": 0,"newline": 0 },{ "id": 2, "word": "stand", "bold": 0,"newline": 0 },{ "id": 3, "word": "before", "bold": 1,"newline": 0 },{ "id": 4, "word": "a", "bold": 0,"newline": 0 },{ "id": 5, "word": "spinning", "bold": 0,"newline": 0 },{ "id": 6, "word": "wheel", "bold": 0,"newline": 0 },{ "id": 7, "word": "at", "bold": 0,"newline": 0 },{ "id": 8, "word": "a", "bold": 0,"newline": 0 },{ "id": 9, "word": "carnival", "bold": 0,"newline": 0 },{ "id": 10, "word":".", "bold": 0,"newline": 0 }], "segments": [{ "start": 0, "end": 0, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 1, "end": 1, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 2, "end": 2, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": ", "target": 0, "priority":5, "author": "" },{ "start": 3, "end": 3, "label": "target", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 1, "priority":5, "author": "" },{ "start": 4, "end": 4, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 5, "end": 5, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 6, "end": 6, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 7, "end": 7, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 8, "end": 8, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 9, "end": 9, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" },{ "start": 10, "end": 10, "label": "_", "status_seg": "H" , "status_lab": "H", "timestamp": "", "target": 0, "priority":5, "author": "" }], "links": [], "image": "http://pageperso.lif.univ-mrs.fr/~frederic.bechet/semflickr_image/3392019836.jpg" , "data": "H:2"  }, ....]}
*/

int check_gold(type_json *rootjson, int ifallgold)
{
type_json *ptdoc,*ptseg,*ptid,*pt;
int ifgold,allgold;
allgold=True;
if (!(ptdoc=find_attribute(rootjson,"documents"))) ERREUR_check_gold("documents missing !!","");
for(ptdoc=ptdoc->down;ptdoc;ptdoc=ptdoc->next)
 {
 if (!(ptid=find_attribute(ptdoc->down,"id"))) ERREUR_check_gold("id missing !!","");
 if (!(ptseg=find_attribute(ptdoc->down,"segments"))) ERREUR_check_gold("segments missing !!","");
 for(ifgold=False,ptseg=ptseg->down;ptseg;ptseg=ptseg->next)
  {
  if (!(pt=find_attribute(ptseg->down,"status_lab"))) ERREUR_check_gold("status_lab missing !!","");
  if (!strcmp(pt->chval,"G")) ifgold=True; else allgold=False;
  }
 if (!ifgold) return False; /* a seg with no gold */
 }
return ifallgold?allgold:True;
}

void stat_gold(type_json *rootjson, int *nbannot, int *nbgold, int ifallgold)
{
type_json *ptdoc,*ptseg,*ptid,*pt;
int ifgold,allgold;
allgold=True;
if (!(ptdoc=find_attribute(rootjson,"documents"))) ERREUR_check_gold("documents missing !!","");
for(ptdoc=ptdoc->down;ptdoc;ptdoc=ptdoc->next,(*nbannot)++)
 {
 if (!(ptid=find_attribute(ptdoc->down,"id"))) ERREUR_check_gold("id missing !!","");
 if (!(ptseg=find_attribute(ptdoc->down,"segments"))) ERREUR_check_gold("segments missing !!","");
 for(ifgold=False,ptseg=ptseg->down;ptseg;ptseg=ptseg->next)
  {
  if (!(pt=find_attribute(ptseg->down,"status_lab"))) ERREUR_check_gold("status_lab missing !!","");
  if (!strcmp(pt->chval,"G")) ifgold=True; else allgold=False;
  }
 if ((ifgold)&&((!ifallgold)||(allgold))) (*nbgold)++;
 }
}

/*................................................................*/

int check_gold_json(char *filename, int ifallgold)
{
int nb,retour;
long taille;
char *buffer;
FILE *fjson;
type_json *ptjson=NULL;

if (!(fjson=fopen(filename,"rt"))) ERREUR_check_gold("can't open:",filename);
fseek(fjson,0,SEEK_END);
taille=ftell(fjson);
buffer=(char*)malloc(sizeof(char)*(taille+1));
fseek(fjson,0,SEEK_SET);
fread(buffer,sizeof(char),taille,fjson);
buffer[taille]='\0';
fclose(fjson);
//fprintf(stderr,"- processing: %s (%d)\n",ch,taille);
nb=0; ptjson=parse_json(buffer,&nb);
retour=check_gold(ptjson,ifallgold);
free(buffer);
free_json(ptjson);
return retour;
}

void stat_json(char *filename, int *nbannot, int *nbgold, int ifallgold)
{
int nb,retour;
long taille;
char *buffer;
FILE *fjson;
type_json *ptjson=NULL;

if (!(fjson=fopen(filename,"rt"))) ERREUR_check_gold("can't open:",filename);
fseek(fjson,0,SEEK_END);
taille=ftell(fjson);
buffer=(char*)malloc(sizeof(char)*(taille+1));
fseek(fjson,0,SEEK_SET);
fread(buffer,sizeof(char),taille,fjson);
buffer[taille]='\0';
fclose(fjson);
fprintf(stderr,"- processing: %s (%d)\n",filename,(int)taille);
nb=0; ptjson=parse_json(buffer,&nb);
*nbannot=*nbgold=0;
stat_gold(ptjson,nbannot,nbgold,ifallgold);
free(buffer);
free_json(ptjson);
}


/* 
int main(int argc, char **argv)
{
int nb,ifallgold;
char *chfjson;
ifallgold=False;
chfjson=NULL;
if (argc>1)
 for(nb=1;nb<argc;nb++)
  if (!strcmp(argv[nb],"-allgold(")) ifallgold=True;
  else
  if (!strcmp(argv[nb],"-json"))
   {
   if (nb+1==argc) ERREUR_check_gold("must have a value after argument;",argv[nb]);
   chfjson=argv[++nb];
   }
  else
  if (!strcmp(argv[nb],"-h"))
   {
   fprintf(stderr,"Syntax: %s [-h] -json <file> [-allgold]\n",argv[0]);
   exit(0);
   }
  else ERREUR_check_gold("unknown option:",argv[nb]);
if (!fjson) ERREUR_check_gold("bad syntax, check '-h'","");
if (check_gold_json(chfjson,ifallgold)) printf("OK\n"); else printf("KO\n");
exit(0);
}
*/
 
