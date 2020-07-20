# MACANNOT for CHILDES Corpora
## Data Preparation

By default, I include a  `demo.json` under `./data/`.

To download and process corpus, just run the command:
```bash
python3 preprocess/downloader.py
```

This will take a few minutes. Then you should be able to find the processed JSON files under `./data/`, structured like:

```
|- data
    |- Champaud
        |- 010906x.json
	        ...
    |- Geneva
    |- Hammelrath
    |- Leveille
    |- MTLN
    |- Palasis
    |- Pauline
    |- VionColas
    |- York
```




## Setup a Local Server

Sync dataset:
```bash
# run Makefile in ./tools/
cd ./tools
make
cd ..
# run update_list_file script
./tools/update_list_file.sh ./data
# The output should be like:
# 'NB=1464  NBDONE=1'
# now you should find 'list_file.json' under ./ and ./data/
```
Install npm modules:
```bash
# move to ./interface and install
cd ./interface
npm install
cd ..
# configure server address and port in ./interface/serveur_macannot.js
# run server
node ./interface/serveur_macannot.js
```
**To whom it may help**, If you can't  understanding all the French like me,  make sure the language option is set to `en` in `./interface/js/ValidateList.js`:

```javascript
this.language = "en";  // line 22
```
Visit the website at `localhost:8888/child.html`, then enjoy it!



> Following is the original README, written in French.

Interface d'annotation de corpus MACANNOT
=========================================

* Contributeurs: Camille Gobert, Frederic Bechet
* 2015-2019
* version avril 2019

Format des données
==================

Les données à annoter sont stockées dans des fichiers JSON. Chaque fichier JSON correspond à un *batch* de données à annoter qui sera présenté ensemble dans l'interface à l'annotateur.
Le principe de base est que chaque *batch* doit être suffisament petit pour que l'annotateur puisse le traiter d'un coup.
Ces *batchs* peuvent être rangés selon une hiérarchie de répertoires qui correspondront à des pages différentes dans l'interface.
Par exemple, si on définit 3 niveaux : thème/corpus/cible , l'annotateur devra d'abord choisir le thème à annoter parmi les thèmes possibles sur l'interface web, puis le corpus, puis la cible, et enfin il tombera sur la liste des fichiers (les *batchs* JSON) à annoter.
Dans chaque page de l'interface le pourcentage de fichier *batchs* terminés correspondant à chaque niveau de la hierarchie est affiché. Attention seuls les *batchs* entièrement validés sont pris en compte dans ce pourcentage.

La hierarchie de fichiers implémentant cette hiérarchie de niveaux d'annotation commence avec le répertoire `data`. Ensuite se trouve les différents niveaux, un répertoire par niveau.
Par exemple, en considérant que l'on a le thème `histoire` qui contient le corpus `C1` avec la cible `T1` et 4 fichiers *batchs* `file1.json`, `file2.json`, `file3.json`, `file4.json`, nous aurons l'arborescence de fichiers suivante:

```
data/histoire/C1/T1/file1.json
data/histoire/C1/T1/file2.json
data/histoire/C1/T1/file3.json
data/histoire/C1/T1/file4.json
```

Il est laissé toute liberté dans le choix des noms, seuls le premier niveau est imposé (`data`) et l'extension des fichiers *batchs* (`.json`).

Format JSON des fichiers batchs
-------------------------------

* chaque fichier *batch* contient un objet JSON composé de 3 parties :
- un entete (`header`)
- les documents a annoter (`documents`)
- des metadata (`annotation`)

1. format `header`
------------------

L'objet `header` contient 4 informations:
- `id` : un identifiant, chaîne de caractère
- `filename` : il s'agit du chemin dans l'arborescence, après le répertoire `data` ; par exemple, pour le fichier `file1.json` dans l'exemple précédent nous aurons: `"filename":"histoire/C1/T1/file1.json"`
- `labels_segment` : un tableau de chaînes de caractères contenant les labels possibles des segments à annoter
- `labels_link`:  un tableau de chaînes de caractères contenant les labels possibles des liens entre les segments (éventuellement vide si aucun liens)

Une 5e information sera rajoutée après l'annotation, il s'agit de la date et heure où l'annotation a été déposée.

2. format `documents`
---------------------

L'objet `documents` est un tableau d'objets, chaque élément du tableau comprenant 4 informations :
- l'identifiant (chaîne de caractère quelconque)
- un tableau de token
- un tableau de segments de tokens
- un tableau de liens entre les segments

Pour les tokens, 4 champs :
- `id` : identifiant (l'identifiant peut être quelconque, numérique ou symbolique)
- `word` : le mot, sous forme de chaîne de caractères
- `bold` : booléen => est-ce que le mot doit etre affiche en gras
- `newline` : booléen => est-ce qu'on doit sauter une ligne après le mot

Pour les segments :
- `start` : indice du début du segment (indice par rapport au tableau de tokens, commence à 0)
- `end` : indice de fin du segment (indice par rapport au tableau de tokens)
- `label` : label du segment
- `status_seg` : `G/H` => est-ce que la segmentation est "gold" (G) ou hypothèse (H)
- `status_lab` : `G/H` => est-ce que le label est "gold" (G) ou hypothèse (H)
- `timestamp` : temps de l'annotation
- `author` : nom de l'annotateur (rajouté après annotation)
- `target` : booléen => est-ce que ce segment est la "cible" principale de l'annotation (met en relief le segment)
- `priority` : entier =>  permet de definir des priorites pour l'affichage des segments

Pour les liens :
- `orig` : indice du segment d'origine de l'arc (indice par rapport au tableau de segments, commence à 0)
- `dest` : indice du segment destination de l'arc
- `label` : label de l'arc
- `status_link` : `G/H` => est-ce que l'arc est "gold" (G) ou hypothèse (H)
- `status_label` : `G/H` => est-ce que le label de l'arc est "gold" (G) ou hypothèse (H)
- `timestamp` : temps de l'annotation
- `author` : nom de l'annotateur (rajouté après annotation)
- `target` : booléen => est-ce que ce lien est la "cible" principale de l'annotation (met en relief le lien)

3. format `annotation`
----------------------

L'objet `annotation` est vide avant l'annotation, il est créé par l'interface en contenant les champs suivants:
- `name`: nom de l'annotateur
- `time_start` : temps de début de l'annotation du fichier (format POSIX)
- `time_end` : temps de fin de l'annotation du fichier (format POSIX)


Exemple de format JSON :
------------------------

```json
{
        "header": {
                "id": "without:sf5951",
                "filename": "coralrom/epinard/file01.json",
                "labels_segment": ["N", "V", "null"],
                "labels_link": ["SUJ","OBJ","null"]
                "timestamp": "",
        },
        "annotation": {
                "name": "toto",
                "time_start": 1538336400820,
                "time_end": 1538336440031
        },
        "documents": [{
                        "id": "2638054798_4",
                        "tokens": [{
                                "id": "AA-offset10",
                                "word": "Mary",
                                "bold": 0,
                                "newline": 0
                        }, {
                                "id": "AA-offset15",
                                "word": "eats",
                                "bold": 0,
                                "newline": 0
                        }, {
                                "id": "AA-offset20",
                                "word": "an",
                                "bold": 0,
                                "newline": 0
                        }, {
                                "id": "AA-offset22",
                                "word": "apple",
                                "bold": 0,
                                "newline": 1
                        }],
                        "segments": [{
                                "start": 0,
                                "end": 0,
                                "label": "N",
                                "status_seg": "G",
                                "status_lab": "G",
                                "timestamp": "",
                                "author": "",
                                "target": 0,
                                "priority": 5
                        }, {
                                "start": 1,
                                "end": 1,
                                "label": "V",
                                "status_seg": "G",
                                "status_lab": "H",
                                "timestamp": "",
                                "author": "",
                                "target": 1,
                                "priority": 5
                        }, {
                                "start": 2,
                                "end": 3,
                                "label": "N",
                                "status_seg": "G",
                                "status_lab": "G",
                                "timestamp": "",
                                "author": "",
                                "target": 0,
                                "priority": 5
                        }],
                        "links": [{
                                "orig": 0,
                                "dest": 1,
                                "label": "SUJ",
                                "status_link": "G",
                                "status_label": "G",
                                "timestamp": "",
                                "author": "",
                                "target": 1
                        }, {
                                "orig": 2,
                                "dest": 1,
                                "label": "OBJ",
                                "status_link": "G",
                                "status_label": "G",
                                "timestamp": "",
                                "author": "",
                                "target": 0
                        }]
}
```


Installation
============

Pour generer un site d'annotation à partir d'un répertoire `macannot`, il faut :
* disposer de NodeJS
* des donnees au format JSON organises selon la hierarchie de repertoire décrite précédemment et placée dans le repertoire `macannot/data/`
* lancer le script `tools/update_list_file.sh` dans le repertoire `macannot`
* modifier les variables `SERVEUR` et `PORT` dans le script `serveur_macannot.js` pour correspondre à votre site d'annotation
* modifier la gestion des annotateurs (nom et mot de passe) dans le tableau `Table_Annotator` du script `serveur_macannot.js`

