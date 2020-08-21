// --------------------------------------------------------------------------------------
// Fonctions générales utiles
// --------------------------------------------------------------------------------------

// Insertion d'élément dans un tableau à un indice donné
function insertElementInArray (array, element, index)
{
	array.splice(index, 0, element);
}

// Suppression d'élément dans un tableau à un indice donné
function removeElementFromArray (array, index)
{
	array.splice(index, 1);
}

// --------------------------------------------------------------------------------------
// CLASSE : CORPUS
// --------------------------------------------------------------------------------------
// Cette classe représente un corpus (issu d'un fichier JSON).
// Elle permet de manipuler ce corpus, indépendemment de l'interface courante.
//
// L'argument url est optionnel.
// S'il est spécifié, l'adresse est utilisée pour directement charger un nouveau corpus dans l'instance crée.
// --------------------------------------------------------------------------------------

function Corpus (cojs,xhttp,filehome)
{
	this.data 	= cojs;
	this.is_loaded 	= true;
	this.filehome=filehome;
	this.xhttp=xhttp;

	// Mémorisation des changements dans le corpus
	this.saved_data = [];

	// Référence vers l'instance courante
	var this_corpus = this;

	this.unloadCorpus = function ()
	{
		this.data 	   = null;
		this.is_loaded = false;
		console.log("Le corpus a bien été supprimé.");
	};

	// --------------------------------------------------------------------------------------
	// Envoi du corpus au serveur
	// --------------------------------------------------------------------------------------

	// A COMPLETER !

	this.sendCorpusToServer = function ()
	{
		console.log("ENVOI DU CORPUS AU SERVEUR.");
			var chdata = JSON.stringify(this.data);
		xhttp.open("POST", "commit", true);
		xhttp.setRequestHeader("Content-type", "text/plain");
		xhttp.send(chdata);
	};

	this.getCorpusJSONData = function()
	{
		return JSON.parse(JSON.stringify(this.data));
	}

	// --------------------------------------------------------------------------------------
	// Informations sur le corpus
	// --------------------------------------------------------------------------------------

	this.corpusIsLoaded = function ()
	{
		return this.data !== null && this.is_loaded;
	};

	this.getNbDocuments = function ()
	{
		return this.data.documents.length;
	};

	this.getNbSegments = function (document_index)
	{
		return this.data.documents[document_index].segments.length;
	};

	// --------------------------------------------------------------------------------------
	// Lecture du corpus
	// --------------------------------------------------------------------------------------

	// Renvoit le contenu du token spécifié
	this.getTokenContent = function (document_index, token_index)
	{
        // console.log("POPO tokens.length="+this.data.documents[document_index].tokens.length+"  token_index="+token_index);
		return this.data.documents[document_index].tokens[token_index].word;
	};

	// Renvoit le contenu formé par le segment spécifié
	this.getSegmentContent = function (document_index, segment_index)
	{
		// Un segment est défini par un token de début (start) et un token de fin (end)
		// On concatène et renvoit donc les tokens compris entre ces deux indices (inclus)
		var segment_content = "";
		var segment  		= this.data.documents[document_index].segments[segment_index];

		for (var token_index = segment.start; token_index <= segment.end; token_index++)
		{
			// On récupère le token courant et le concatène à la phrase
			var current_token_content = this.getTokenContent(document_index, token_index);
			segment_content += current_token_content;

			// S'il ne s'agit pas du dernier token à concaténer, on ajoute également un espace
			if (token_index !== segment.end)
				segment_content += " ";
		}

		return segment_content;
	};

	// Renvoit la "phrase" formée par les segments d'un document spécifié
	this.getSentence = function (document_index)
	{
		// On concatène simplement les contenus des segments mis bout à bout
		var sentence 	= "";
		var nb_segments = this.getNbSegments(document_index);

		for (var segment_index = 0; segment_index < nb_segments; segment_index++)
		{
			sentence += this.getSegmentContent(document_index, segment_index);

			// S'il ne s'agit pas du dernier segment à concaténer, on ajoute également un espace
			if (segment_index !== nb_segments - 1)
				sentence += " ";
		}

		return sentence;
	};

	// --------------------------------------------------------------------------------------
	// Accès aux éléments du corpus
	// --------------------------------------------------------------------------------------

	this.getDocuments = function ()
	{
		return this.data.documents;
	};

	this.getDocument = function (document_index)
	{
		return this.data.documents[document_index];
	};

	this.getDocumentFromDocumentID = function (document_id)
	{
		for (document_index in this.data.documents)
		{
			var current_document = this.getDocument(document_index);
			if (current_document.id != document_id) continue;

			return current_document;
		}

		return undefined;
	};

	this.getSegment = function (document_index, segment_index)
	{
		return this.getDocument(document_index).segments[segment_index];
	};

	this.isComment = function (document_index)
	{
		return this.getDocument(document_index).type == "comment" || this.getDocument(document_index).type == "gem";
	}

	this.getComment = function (document_index)
	{
		if (this.getDocument(document_index).type == "comment")
			return this.getDocument(document_index).explanation + ": " + this.getDocument(document_index).turn;
		else if (this.getDocument(document_index).type == "gem")
			return "[" + this.getDocument(document_index).explanation + "]: " + this.getDocument(document_index).turn;
		else return "NULL";
	}

	this.getTurnUtterance = function (document_index)
	{
		return this.getDocument(document_index).turn;
	}

	this.getTurnSpeaker = function (document_index)
	{
		return this.getDocument(document_index).subject;
	}

	this.getTurnExplanation = function (document_index)
	{
		return this.getDocument(document_index).explanation;
	}

	this.getTurnLabel = function (document_index, index, type)
	{
		if (index == 1 && type == 'a') return this.getDocument(document_index).label_1_a;
		else if (index == 1 && type == 'b') return this.getDocument(document_index).label_1_b;
		else if (index == 1 && type == 'c') return this.getDocument(document_index).label_1_c;
		else if (index == 2 && type == 'a') return this.getDocument(document_index).label_2_a;
		else if (index == 2 && type == 'b') return this.getDocument(document_index).label_2_b;
		else if (index == 2 && type == 'c') return this.getDocument(document_index).label_2_c;
		else return 'Wrong index-type';
	}

	this.getImage = function (document_index)
	{
		if (this.getDocument(document_index).image!=undefined)
 			return this.getDocument(document_index).image;
		else
			return null;
	};


	this.getToken = function (document_index, token_index)
	{
		return this.getDocument(document_index).tokens[token_index];
	};

	this.getLink = function (document_index, link_index)
	{
		return this.getDocument(document_index).links[link_index];
	};

	// Récupère tous les liens similaires au lien link
	this.getMatchingLinksIndexes = function (document_index, link)
	{
		var parent_document 	   = this.data.documents[document_index];
		var matching_links_indexes = [];

		links_loop:
		for (var index in parent_document.links)
		{
			var current_link = parent_document.links[index];
			
			// On ne compare que les propriétés existantes (de link)
			for (var property in link)
				if (current_link[property] != link[property]) continue links_loop;

			// Si on trouve un lien identique à link, on mémorise l'indice
			matching_links_indexes.push(index);
		}

		return matching_links_indexes;
	};

	this.getMatchingLinks = function (document_index, link)
	{
		var matching_links_indexes = this.getMatchingLinksIndexes(document_index, link);
		var matching_links 		   = [];

		for (var i in matching_links_indexes)
			matching_links.push(this.getLink(document_index, matching_links_indexes[i]));

		return matching_links;
	};

	this.getLabelsListByType = function (list_index)
	{
		if (list_index == "1_a" || list_index == "1_b" || list_index == "1_c")
			return this.data.header.labels_1;
		else if (list_index == "2_a" || list_index == "2_b" || list_index == "2_c")
			return this.data.header.labels_2;
		else{
			console.error("Wrong List Type: ", list_index);
			return ["NULL"];
		}
	};

	this.getLinksLabelsList = function ()
	{
		return this.data.header.labels_link;
	};

	// --------------------------------------------------------------------------------------
	// Edition des propriétés des segments
	// --------------------------------------------------------------------------------------

	// Remplace les propriétés des segments concernés par celles de l'objet properties
	this.setDocumentSegmentsProperties = function (document_index, properties, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		var nb_targets_found = 0;
		for (var segment_index in this.data.documents[document_index].segments)
		{
			var current_segment = this.data.documents[document_index].segments[segment_index];
			if (current_segment.target === 1)
				nb_targets_found++;
			
			// On prend éventuellement en compte la priorité / le fait d'etre cible ou non
			if (ignore_priority_zero && current_segment.priority === 0) continue;
			if (only_targets && current_segment.target === 0) 			continue;

			// On vérifie éventuellement que le segment ou l'étiquette est une hypothèse
			if (only_segments_hypothesis && (current_segment.status_seg == "G" || current_segment.status_seg == "C")) continue;
			if (only_labels_hypothesis   && (current_segment.status_lab == "G" || current_segment.status_lab == "C")) continue;

			// si deja tout est gold dans le segment, on l'ignore
			if ((current_segment.status_lab == "G")&&(current_segment.status_seg == "G")) continue;

			// Si un numéro de cible est défini, on n'affecte que cette énième cible
			if (nth_target && current_segment.target === 1 && nth_target != nb_targets_found) continue;

			for (var property in properties)
				current_segment[property] = properties[property];
		}
	};

	// Place les statuts de segmentation des segments concernés comme gold
	this.setDocumentsSegmentsAsGold = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_seg": "G", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target);
	};

	// Place les statuts de segmentation des segments concernés comme annulés (erreur)
	this.setDocumentsSegmentsAsCanceled = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_seg": "C", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target);
	};

	// Place les statuts d'étiquetage des segments concernés comme gold
	this.setDocumentsLabelsAsGold = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_lab": "G", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target);
	};

	// Place les statuts d'étiquetage des segments concernés comme annulés (erreur)
	this.setDocumentsLabelsAsCanceled = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_lab": "C", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target);
	};

	// Place les deux statuts des segments concernés comme gold
	this.setDocumentAsGold = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_seg": "G", "status_lab": "G", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target); 
	};

	// Place les deux statuts des segments concernés comme annulés (erreur)
	this.setDocumentAsCanceled = function (document_index, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target)
	{
		this.setDocumentSegmentsProperties(document_index, {"status_seg": "C", "status_lab": "C", "timestamp": Date.now(), "author": this.getAuthor()}, ignore_priority_zero, only_targets, only_segments_hypothesis, only_labels_hypothesis, nth_target);
	};

	// --------------------------------------------------------------------------------------
	// Edition des segments (segmentation)
	// --------------------------------------------------------------------------------------

	// CLASSE PRIVEE : Segment
	// Cette classe représente un segment de document (dans un corpus)
	function Segment (segment)
	{
		// On récupère du paramètre les valeurs des champs qu'on y trouve
		// Sinon, on fixe des valeurs par défaut au nouveau segment
		this.label 		= segment.label 	 || "NULL";
		this.priority 	= segment.priority 	 || 0;
		this.target 	= segment.target 	 || 0;
		this.status_lab = segment.status_lab || "H0";
		this.status_seg = segment.status_seg || "H0";
		this.start 	    = segment.start 	 || 0;
		this.end 	    = segment.end 		 || 0;
		this.timestamp  = segment.timestamp  || Date.now();
		this.newline 	= segment.newline 	 || 0;
	};

	// Subdivise un segment en deux (au milieu)
	this.subdivideSegment = function (document_index, segment_index)
	{
		// On récupère le document parent
		var parent_document = this.data.documents[document_index];

		// On récupère le segment concerné et le nombre de tokens le composant
		var segment = parent_document.segments[segment_index];
		var segment_nb_tokens = segment.end - segment.start + 1;

		// Si le segment ne possède qu'un seul token, on ne peut pas le subdiviser
		if (segment_nb_tokens === 1)
		{
			console.log("Impossible de subdiviser un segment possédant un unique token.");
			return;
		}

		// On calcule les indices de début et de fins des tokens des subdivisions
		var first_subdivision_start = segment.start;
		var first_subdivision_end   = Math.floor((segment.start + segment.end) / 2);

		var second_subdivision_start = first_subdivision_end + 1;
		var second_subdivision_end   = segment.end;

		// On supprime le segment d'origine et ajoute les deux subdivisions à la place
		removeElementFromArray(parent_document.segments, segment_index);

		var first_subdivision  = new Segment({start: first_subdivision_start, end: first_subdivision_end});
		var second_subdivision = new Segment({start: second_subdivision_start, end: second_subdivision_end});

		insertElementInArray(parent_document.segments, first_subdivision, segment_index);
		insertElementInArray(parent_document.segments, second_subdivision, segment_index + 1);
	};

	// Ajoute un token au début d'un segment
	this.expandSegmentToTheLeft = function (document_index, segment_index)
	{
		// On récupère le document parent
		var parent_document = this.data.documents[document_index];

		// Si le segment est le premier, il ne peut etre étendu par la gauche
		if (segment_index === 0)
		{
			console.log("Impossible d'étendre par la gauche le premier segment d'une \"phrase\".");
			return;
		}

		// On récupère le segment à étendre et le segment suivant
		var segment_to_expand = parent_document.segments[segment_index];
		var previous_segment  = parent_document.segments[segment_index - 1];

		// On modifie les débuts et fins de ces deux segments
		segment_to_expand.start--;
		previous_segment.end--;
/*
		// On marque le statut de segmentation du segment comme gold
		segment_to_expand.status_seg = "G";
*/
		// Si le segment précédent est désormais vide, on le supprime
		if (previous_segment.start > previous_segment.end)
			removeElementFromArray(parent_document.segments, segment_index - 1);
	};

	// Ajoute un token à la fin d'un segment
	this.expandSegmentToTheRight = function (document_index, segment_index)
	{
		// On récupère le document parent
		var parent_document = this.data.documents[document_index];

		// Si le segment est le dernier, il ne peut etre étendu par la droite
		if (segment_index === parent_document.segments.length - 1)
		{
			console.log("Impossible d'étendre par la droite le dernier segment d'une \"phrase\".");
			return;
		}

		// On récupère le segment à étendre et le segment suivant
		var segment_to_expand = parent_document.segments[segment_index];
		var next_segment 	  = parent_document.segments[segment_index + 1];

		// On modifie les débuts et fins de ces deux segments
		segment_to_expand.end++;
		next_segment.start++;
/*
		// On marque le statut de segmentation du segment comme gold
		segment_to_expand.status_seg = "G";
*/
		// Si le segment suivant est désormais vide, on le supprime
		if (next_segment.start > next_segment.end)
			removeElementFromArray(parent_document.segments, segment_index + 1);
	};

	// Fusionne deux segments, en conservant les propriétés du principal
	this.mergeTwoSegments = function (document_index, main_segment_index, second_segment_index)
	{
		// On récupère le document parent et les deux segments
		var parent_document = this.data.documents[document_index];
		var main_segment 	= parent_document.segments[main_segment_index];
		var second_segment 	= parent_document.segments[second_segment_index];

		var second_segment_nb_tokens = second_segment.end - second_segment.start + 1;

		// On ne peut fusionner deux segments que s'ils sont voisins
		// Cas où le segment principal est à droite
		if (main_segment_index === second_segment_index + 1)
		{
			// Dans ce cas, on étend le segment principal à gauche
			for (var nb_merged_tokens = 0; nb_merged_tokens < second_segment_nb_tokens; nb_merged_tokens++)
				this.expandSegmentToTheLeft(document_index, main_segment_index);
		}
		// Cas où le segment principal est à gauche
		else if (main_segment_index === second_segment_index - 1)
		{
			// Dans ce cas, on étend le segment principal à droite
			for (var nb_merged_tokens = 0; nb_merged_tokens < second_segment_nb_tokens; nb_merged_tokens++)
				this.expandSegmentToTheRight(document_index, main_segment_index);
		}
		else
		{
			console.log("Impossible de fusionner deux segments n'étant pas voisins.");
			return;
		}
	};

	// Fusionne avec le segment à sa gauche
	this.mergeWithLeftSegment = function (document_index, segment_index)
	{
		this.mergeTwoSegments(document_index, segment_index, segment_index - 1);
	};

	// Fusionne avec le segment à sa droite
	this.mergeWithRightSegment = function (document_index, segment_index)
	{
		this.mergeTwoSegments(document_index, segment_index, segment_index + 1);
	};

	// Extrait un sous-segment d'un segment père (crée entre un et trois segments à la place de l'existant)
	this.extractSubsegment = function (document_index, segment_index, first_token_index, last_token_index)
	{
		// On récupère le document parent
		var parent_document = this.data.documents[document_index];

		// On récupère le segment concerné et le nombre de tokens le composant
		var segment 		  = parent_document.segments[segment_index];
		var segment_nb_tokens = segment.end - segment.start + 1;

		// Si le segment ne possède qu'un seul token, on ne peut rien en extraire
		if (segment_nb_tokens === 1)
		{
			console.log("Impossible d'extraire un sous-segment d'un segment possédant un unique token.");
			return;
		}

		// On calcule les (éventuels) indices de début et de fins des sous-segments précédent et suivant celui que l'on extrait, et vérifie si de tels sous-segments doivent ou non etre crées
		var previous_subsegment_start = segment.start;
		var previous_subsegment_end   = first_token_index - 1;

		var previous_subsegment_exists = previous_subsegment_end - previous_subsegment_start >= 0;

		var next_subsegment_start = last_token_index + 1;
		var next_subsegment_end   = segment.end;

		var next_subsegment_exists = next_subsegment_end - next_subsegment_start >= 0;

		// On supprime le segment d'origine
		removeElementFromArray(parent_document.segments, segment_index);

		// Finalement, on ajoute les nouveaux sous-segments à la place (s'ils existent)
		var subsegment_insertion_index 		= previous_subsegment_exists ? segment_index + 1 : segment_index;
		var next_subsegment_insertion_index = previous_subsegment_exists ? segment_index + 2 : segment_index + 1;

		if (previous_subsegment_exists)
		{	
			var previous_subsegment = new Segment({"start": previous_subsegment_start, "end": previous_subsegment_end, "target": segment.target, "priority": segment.priority});
			insertElementInArray(parent_document.segments, previous_subsegment, segment_index);
		}

		var subsegment = new Segment({"start": first_token_index, "end": last_token_index, "target": segment.target, "priority": segment.priority, "status_seg": "G"});
		insertElementInArray(parent_document.segments, subsegment, subsegment_insertion_index);

		if (next_subsegment_exists)
		{	
			var next_subsegment = new Segment({"start": next_subsegment_start, "end": next_subsegment_end, "target": segment.target, "priority": segment.priority});
			insertElementInArray(parent_document.segments, next_subsegment, next_subsegment_insertion_index);
		}
	};

	// --------------------------------------------------------------------------------------
	// Edition des propriétés des liens
	// --------------------------------------------------------------------------------------

	this.setLinksProperties = function (document_index, properties, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		/// On récupère les liens du document donné
		var document_links = this.getDocument(document_index).links;

		// Si un numéro de cible est spécifié, on ne s'inétresse qu'aux liens cibles
		var nb_targets_found = 0;
		if (nth_target >= 0)
			document_links = this.getMatchingLinks(document_index, {"target": 1});
			
		for (var index in document_links)
		{
			var current_link = document_links[index];

			// On se limite éventuellement aux seuls liens cibles
			if (only_targets && current_link.target === 0) continue;

			// On se limite éventuellement aux liens ayant deux statuts hypothétiques
			if (only_links_hypothesis 		 && (current_link.status_link  == "G" || current_link.status_link  == "C")) continue;
			if (only_links_labels_hypothesis && (current_link.status_label == "G" || current_link.status_label == "C")) continue;

			// Si un numéro de cible est précisé, on ne s'intéresse qu'à cette énième cible
			if (current_link.target === 1)
				nb_targets_found++;

			if (nth_target && nb_targets_found < nth_target) continue;

			for (var property in properties)
				current_link[property] = properties[property];

			if (nth_target && nb_targets_found === nth_target) break;
		}
	};

	this.setLinksStatusAsGold = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_link": "G", "timestamp": Date.now(), "author": this.getAuthor()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	this.setLinksStatusAsCanceled = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_link": "C", "timestamp": Date.now()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	this.setLinksLabelsStatusAsGold = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_label": "G", "timestamp": Date.now(), "author": this.getAuthor()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	this.setLinksLabelsStatusAsCanceled = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_label": "C", "timestamp": Date.now()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	this.setLinksAsGold = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_link": "G", "status_label": "G", "timestamp": Date.now(), "author": this.getAuthor()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	this.setLinksAsCanceled = function (document_index, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target)
	{
		this.setLinksProperties(document_index, {"status_link": "C", "status_label": "C", "timestamp": Date.now()}, only_targets, only_links_hypothesis, only_links_labels_hypothesis, nth_target);
	};

	// --------------------------------------------------------------------------------------
	// Edition des liens
	// --------------------------------------------------------------------------------------

	// CLASSE PRIVEE : Lien
	// Cette classe représente un lien entre deux segments (dans un corpus)
	function Link (link)
	{
		// On récupère du paramètre les valeurs des champs qu'on y trouve
		// Sinon, on fixe des valeurs par défaut au nouveau lien
		this.label 		   = link.label 	   || "NULL";
		this.target 	   = link.target 	   || 0;
		this.status_label  = link.status_label || "H0";
		this.status_link   = link.status_link  || "H0";
		this.orig 		   = link.orig 		   || undefined;
		this.dest 		   = link.dest 		   || undefined;
		this.timestamp 	   = link.timestamp    || Date.now();
	};

	// Ajoute un lien entre deux segments (link est pris tel quel, et non copié !)
	this.addLink = function (document_index, link)
	{
		var parent_document = this.data.documents[document_index];

		if (! parent_document.links)
			parent_document.links = [];
		parent_document.links.push(link);
	};

	// Supprime le premier lien entre deux segments de la forme de link
	this.removeLink = function (document_index, link)
	{
		var parent_document = this.data.documents[document_index];
		
		// On récupère les indices de tous les liens correspondants à link
		var matching_links_indexes = this.getMatchingLinksIndexes(document_index, link);

		// Si aucun lien ne correspond, on ne fait rien
		if (matching_links_indexes.length === 0) return;

		// On supprime alors le premier lien
		removeElementFromArray(parent_document.links, matching_links_indexes[0]);
	};

	// Modifie un lien entre deux segments de la forme de link suivant les propriétés de new_properties
	this.editLinks = function (document_index, link, new_properties)
	{
		var parent_document = this.data.documents[document_index];
		
		// On récupère les indices de tous les liens correspondants à link
		var matching_links_indexes = this.getMatchingLinksIndexes(document_index, link);

		// On modifie toutes les propriétés de ces liens suivant celles de new_properties
		for (var link_index in matching_links_indexes)
			for (var property in new_properties)
				parent_document.links[link_index][property] = new_properties[property];

		// On met à jour la date d'édition du lien
		link.timestamp = Date.now();
	};

	// --------------------------------------------------------------------------------------
	// Métadonnées
	// --------------------------------------------------------------------------------------

	// A VOIR : PRISE EN COMPTE DANS LES VERSIONS SAUVEGARDEES ?

	this.getMetadata = function (field)
	{
		return this.data.annotation[field];
	};

	this.getAuthor = function ()
	{
		return this.getMetadata("name");
	};

	this.getStartTime = function ()
	{
		return this.getMetadata("time_start");
	};

	this.getEndTime = function ()
	{
		return this.getMetadata("time_end");
	};

	this.setMetadata = function (field, value)
	{
		this.data.annotation[field] = value;
	};

	this.setAuthor = function (author)
	{
		this.setMetadata("name", author);
	};

	this.setStartTime = function (start_time)
	{
		this.setMetadata("time_start", start_time);
	};

	this.setEndTime = function (end_time)
	{
		this.setMetadata("time_end", end_time);
	};

	// --------------------------------------------------------------------------------------
	// Historique des modifications
	// --------------------------------------------------------------------------------------

	this.saveCurrentVersion = function ()
	{
		this.saved_data.push(JSON.stringify(this.data));
	};

	this.restorePreviousVersion = function ()
	{
		if (this.saved_data.length === 0)
		{
			console.log("Aucun ancien corpus n'est disponible.");
			return false;
		}

		this.data = JSON.parse(this.saved_data.pop());
		return true;
	};

}
 
