// --------------------------------------------------------------------------------------
// CLASSE : LISTE A VALIDER
// --------------------------------------------------------------------------------------
// Cette classe est utile pour représenter une liste de documents en HTML.
// Elle permet d'afficher de telles données, et de laisser un utilisateur les valider, corriger, etc.
//
// Cette classe nécessite le passage d'un corpus chargé en paramètre, et une page HTML associée.
// --------------------------------------------------------------------------------------

// const { listenerCount } = require("process");
// const download = require('downloadjs')
// import download = require("downloadjs");
// import { download } download

var FREDoldsegment = null ;

function ValidateList (corpus, links_mode)
{
	this.corpus 	= corpus;
	this.links_mode = links_mode;

	// -------------------- Paramètres --------------------

	// Langue de l'interface
	// Nativement, le français ("fr") et l'anglais ("en") sont disponibles
	// Voir le fichier interface_strings.js à ce sujet
	this.language = "fr";

	// Noeuds principaux
	this.main_node 		= $("#validator");

	this.documents 		= $("#documents");
	this.main_menu 		= $("#main_menu");
	this.options_popup  = $("#options_popup");
	this.global_actions = $("#global_actions");

	// Etiquette par défaut, dont le nom n'est pas affiché si c'est une hypothèse
	this.empty_label = "NULL";

	// Chaine affichée devant un segment ou un token mis à la ligne volontairement
	this.segment_newline_string = "&para;";
	this.token_newline_string   = "&mdash;";

	// Prise en compte de la propriété "target" des segments
	// Si vrai, seuls les segments avec target à 1 sont mis en avant et modifiables
	this.target_mode = false;

	// Mode de validation des boutons Tout valider/Erreur
	// Si vrai, les segments avec une priorité nulle (0) ne sont pas affectés
	this.ignore_priority_zero = true;

	// Limitation de la portée de l'édition aux hypothèses
	this.only_edit_segments_hypothesis 	   = false;
	this.only_edit_labels_hypothesis 	   = false;

	this.only_edit_links_hypothesis 	   = true;
	this.only_edit_links_labels_hypothesis = true;

	// Portée des boutons Tout valider/Erreur (étiquettes et/ou segmentation et/ou liens et/ou étiquettes de liens)
	this.validate_segments = true;
	this.validate_labels   = true;

	this.validate_links 	   = true;
	this.validate_links_labels = true;

	this.cancel_segments 	 = true;
	this.cancel_labels 		 = true;

	this.cancel_links 		 = true;
	this.cancel_links_labels = true;

	// Mise en avant des tokens de la phrase pointée
	// Si vrai, la découpe en tokens est mise en avant lorsqu'on pointe une phrase
	this.highlight_tokens = false;

	// Mode de validation phrase par phrase
	// Si vrai, seule la phrase sélectionnée est affichée
	this.validate_sentence_by_sentence = false;

	// Boucle lors du parcours des phrases
	// Si vrai, on peut passer de la première à la dernière phrase (et inversement)
	this.loop_while_browsing_sentences = false;

	// Prise en compte de la distance des segments par rapport aux cibles
	// Si vrai, les segments de distance supérieure à une distance fixée sont masqués
	this.hide_far_segments 		    = false;
	this.close_segment_max_distance = 1;

	// Nécessite l'appui d'une touche (CTRL) pour que la sélection d'un bout de segment le subdivise
	// Si faux, c'est l'ouverture du popup d'édition qui nécessite cela !
	this.hold_ctrl_to_subdivide_segments = true;

	// Si vrai, remplace le contenu des cibles par leurs étiquettes
	this.only_display_targets_labels = false;

	// Choix des liens affichés dans le popup de liens
	this.display_links_origins 		= true;
	this.display_links_destinations = true;

	// -------------------- Membres "privés" utiles --------------------

	this.edit_popup_is_displayed 	 = false;
	this.links_popup_is_displayed 	 = false;
	this.options_popup_is_displayed  = false;
	this.link_is_beeing_added 		 = false;
	this.edit_mode_is_open			 = false;

	this.selected_sentence 				 = 0;
	this.editable_sentence 				 = 0;
	this.segment_max_distance_to_targets = 0;
	this.last_segment_link_label  		 = "";
	this.links_popup_segment_node 		 = null;



	// Référence privée vers l'instance elle-meme (utile à certaines méthodes)
	var this_validate_list = this;

	// --------------------------------------------------------------------------------------
	// Génération et affichage du corpus
	// --------------------------------------------------------------------------------------

	// Renvoit un segment sous forme de chaine où chaque token est isolé dans une balise <span>
	this.getSegmentContentAsHTMLString = function (document_index, segment_index)
	{
		var segment_html_string = "";
		var segment  			= this.corpus.getSegment(document_index, segment_index);

		for (var token_index = segment.start; token_index <= segment.end; token_index++)
		{
			// On récupère le token courant et son contenu
//console.log("POPO document_index="+document_index+"  token_index="+token_index);  

			var current_token 		  = this.corpus.getToken(document_index, token_index);
			var current_token_content = this.corpus.getTokenContent(document_index, token_index);

			// On vérifie si le token est mis en avant ou débute une ligne
			var newline = current_token.newline === 1;
			var bold 	= current_token.bold 	=== 1;
		
			// Token débutant une ligne
			if (newline)
			{
				// Si ce n'est pas la première ligne, on saute une ligne
				if (token_index != segment.start)
					segment_html_string += "<br/>";
				segment_html_string += "<span class=\"token_newline\">" + this.token_newline_string + "</span>";
			}

			// On le place dans une balise <span> de classe "token"
			if (bold)
				segment_html_string += "<span class=\"token bold tok_" + token_index + "\">";
			else
				segment_html_string += "<span class=\"token tok_" + token_index + "\">";

			segment_html_string += current_token_content.replace("<", "&lt;").replace(">", "&gt;");
			segment_html_string += "</span>";

			// S'il ne s'agit pas du dernier token à concaténer, on ajoute un espace après la balise fermante
			if (token_index !== segment.end)
				segment_html_string += " ";
		}

		return segment_html_string;
	};

	// Duplication (si nécessaire) et préparation d'une "phrase" (de son contenu) au mode cible
	// Un tableau de noeuds représentant le document et adaptés au mode cible est renvoyé
	this.updateSentenceNodeForTargetMode = function (sentence_node, target_indexes, links_targets)
	{
		var nodes = [];
		if (! this.target_mode)
		{
			nodes.push(sentence_node);
			return nodes;
		}

		// CAS DU MODE SEGMENTS/ETIQUETTES
		if ((! this.links_mode) && target_indexes.length > 0)
		{
			for (var target = 0; target < target_indexes.length; target++)
			{
				// On crée une copie du noeud de la phrase, sur laquelle on travaille ici
				var current_sentence_node = $(sentence_node[0].cloneNode(true));

				// On englobe les contextes gauches et droits dans des blocs
				var left_context_node  = $("<div class=\"context target_left_context\">");
				var right_context_node = $("<div class=\"context target_right_context\">");

				var segments = current_sentence_node.find(".segment");

				// On retire tous les marqueurs de cibles, sauf celui de la cible courante (et ajoute son numéro de cible)
				var current_sentence_targets 		  = current_sentence_node.find(".target");
				var current_sentence_remaining_target = $(current_sentence_targets[target]);
				current_sentence_targets.removeClass("target");
				current_sentence_remaining_target.addClass("target tar_" + (target + 1));

				// Si l'option est activée, on remplace le contenu par l'étiquette et n'affiche pas cette dernière
				if (this.only_display_targets_labels)
				{
					var remaining_target_label = current_sentence_remaining_target.children(".segment_label");
					var target_segment_content = current_sentence_remaining_target.children(".segment_content");
					var segment_content 	   = target_segment_content.text();

					target_segment_content.html(remaining_target_label.html());
					remaining_target_label.css("visibility", "hidden");

					// On met le contenu en infobulle
					current_sentence_remaining_target.find(".segment_content").attr("title", segment_content);
				}

				// On récupère l'indice de la cible courante
				var current_target_index = target_indexes[target];

				// On raisonne par rapport au nombre de cibles trouvées pour placer le contenu de la phrase dans le bon contexte
				var sentence_children = current_sentence_node.children();
				var nb_targets_found  = 0;

				for (var child_index = 0; child_index < sentence_children.length; child_index++)
				{
					var current_child = $(sentence_children[child_index]);

					if (current_child.hasClass("target"))
					{
						nb_targets_found++;
						continue;
					}

					if (nb_targets_found === 0)
						left_context_node.append(current_child);

					if (nb_targets_found === 1)
						right_context_node.append(current_child);
				}

				current_sentence_node.prepend(left_context_node);
				current_sentence_node.append(right_context_node);

				// On ajoute la copie du noeud à la liste des noeuds à renvoyer pour cette phrase
				nodes.push(current_sentence_node);
			}
		}

		// CAS DU MODE LIENS
		else if (this.links_mode && links_targets.length > 0)
		{
			// Ajout des contextes gauches/droits des cibles, avec possibilité de duplication de phrase
			for (var link_index = 0; link_index < links_targets.length; link_index++)
			{
				var current_link_target = links_targets[link_index];

				// On crée une copie du noeud de la phrase, sur laquelle on travaille ici
				var current_sentence_node = $(sentence_node[0].cloneNode(true));

				// On englobe les contextes dans des blocs
				var left_context_node    = $("<div class=\"context target_link_left_context\">");
				var central_context_node = $("<div class=\"context target_link_central_context\">");
				var right_context_node   = $("<div class=\"context target_link_right_context\">");

				var segments = current_sentence_node.find(".segment");

				// On récupère les indices des deux extremités du lien cible courant
				var link_target_first_segment_index  = current_link_target.orig;
				var link_target_second_segment_index = current_link_target.dest;

				// On inverse les indices si nécessaire
				if (link_target_first_segment_index > link_target_second_segment_index)
				{
					var origin_index 				 = link_target_first_segment_index;
					link_target_first_segment_index  = link_target_second_segment_index;
					link_target_second_segment_index = origin_index;
				}

				// On identifie les deux segments concernés, dans l'ordre
				var link_target_first_segment  = segments.eq(link_target_first_segment_index);
				var link_target_second_segment = segments.eq(link_target_second_segment_index);
				
				// On retire les marqueurs d'extremités de liens cibles de tous les segments
				segments.removeClass("link_target");

				// On remet ceux des cibles courantes + leur numéro de lien ciblé
				link_target_first_segment.addClass("link_target tar_" + (link_index + 1));
				link_target_second_segment.addClass("link_target tar_" + (link_index + 1));

				// Si l'option est activée, on remplace les contenus par l'étiquette, et n'affiche pas ces dernières
				if (this.only_display_targets_labels)
				{
					var first_segment_content = link_target_first_segment.find(".segment_content");
					var first_segment_label   = link_target_first_segment.find(".segment_label");
					
					first_segment_content.attr("title", first_segment_content.text())
										 .html(first_segment_label.text());
					first_segment_label.css("visibility", "hidden");

					var second_segment_content = link_target_second_segment.find(".segment_content");
					var second_segment_label   = link_target_second_segment.find(".segment_label");
					
					second_segment_content.attr("title", second_segment_content.text())
										  .html(second_segment_label.text());
					second_segment_label.css("visibility", "hidden");
				}

				// On affiche l'étiquette associée aux segments du lien cible si elle est définie
				if (current_link_target.label && current_link_target.label.length > 0)
				{
					link_target_first_segment.find(".segment_link_label").html(current_link_target.label);
					link_target_second_segment.find(".segment_link_label").html(current_link_target.label);
				}

				// On raisonne par rapport au nombre de cibles trouvées pour placer le contenu de la phrase dans le bon contexte
				var sentence_children = current_sentence_node.children();
				var nb_targets_found = 0;

				for (var child_index = 0; child_index < sentence_children.length; child_index++)
				{
					var current_child = $(sentence_children[child_index]);

					if (current_child.hasClass("link_target"))
					{
						nb_targets_found++;
						continue;
					}

					if (nb_targets_found === 0)
						left_context_node.append(current_child);

					if (nb_targets_found === 1)
						central_context_node.append(current_child);

					if (nb_targets_found === 2)
						right_context_node.append(current_child);
				}

				current_sentence_node.prepend(left_context_node);
				link_target_first_segment.after(central_context_node);
				current_sentence_node.append(right_context_node);

				// On ajoute la copie du noeud à la liste des noeuds à renvoyer pour cette phrase
				nodes.push(current_sentence_node);
			}
		}

		return nodes;
	};

	// Renvoit le contenu de la "phrase" du document spécifié sous forme de tableau de noeuds jQuery (dans un objet avec d'autres infos)
	// Si on est en mode cible et que la phrase est dupliquée (plus d'une cible), il y aura plusieurs noeuds
	this.getSentenceContentAsNodes = function (document_index)
	{
		// var current_document = this.corpus.getDocument(document_index);
		// var nb_segments 	 = this.corpus.getNbSegments(document_index);
		
		var target_indexes = [];
		var links_targets  = [];

		// On crée le noeud contenant le contenu de la "phrase"
		var sentence_node = $("<div class=\"sentence_content\">");
//console.log("ZOZO");

		// Tag the speaker in a <div.
		var current_speaker_container = $("<div class=\"speaker\">");
		var current_explanation_container = $("<div class=\"turn_explanation\">");
		// Chaque segment est englobé dans un <div>
		var current_segment_container = $("<div class=\"segment\">");

		// var current_segment = this.corpus.getSegment(document_index, segment_index);
		var current_segment = this.corpus.getDocument(document_index);
		if (!this.corpus.isComment(document_index)){
			var current_turn_utterance = this.corpus.getTurnUtterance(document_index);
			var current_speaker = this.corpus.getTurnSpeaker(document_index);
			// var current_label = this.corpus.getTurnLabel1(document_index);

			var current_speaker_label = $("<span class=\"speaker_label\">" + current_speaker + "</span>");
			current_speaker_container.append(current_speaker_label);

			var current_turn_explanation = $("<span class=\"turn_explanation_content\">" + this.corpus.getTurnExplanation(document_index) + "</span>");
			current_explanation_container.append(current_turn_explanation);


			// Ce div contient tout d'abord l'étiquette du segment
			// TODO: update labels
			// var current_segment_label = $("<span class=\"segment_label\">" + current_label + "</span>");
			// current_segment_container.append(current_segment_label);

			// Si le segment a une valeur par défaut et est en hypothèse, on ne l'affiche pas (espace insécable afin d'aligner les segments)
			// if (current_segment.label == this.empty_label
			// &&  current_segment.status_lab != "G")
			// 		current_segment_label.html("&emsp;");

			// Puis on lui ajoute le segment en lui-meme
			var current_segment_content = $("<span class=\"segment_content\">");
			current_segment_container.append(current_segment_content);

			// On ajoute AU CONTENEUR des classes relatives aux propriétés du segment courant
			current_segment_container.addClass("seg_0");
			// current_segment_container.addClass("priority_" + current_segment.priority);
			
			// Statut/présence de l'étiquette
			// if (current_label !== this.empty_label)
			// 	current_segment_container.addClass("labelled");

			if (current_segment.status_lab == "G")
				current_segment_container.addClass("label_gold");
			if (current_segment.status_lab == "C")
				current_segment_container.addClass("label_canceled");

			// Statut de la segmentation
			if (current_segment.status_seg == "G")
				current_segment_container.addClass("segment_gold");
			if (current_segment.status_seg == "C")
				current_segment_container.addClass("segment_canceled");

			// Cas d'une cible, HORS mode lien
			// if (current_segment.target === 1)
			// {
			// 	current_segment_container.addClass("target");
			// 	target_indexes.push(segment_index);
			// }

			// On ajoute le contenu textuel du segment courant
			// var current_segment_content_text = this.getSegmentContentAsHTMLString(document_index, segment_index);
			// if (segment_index !== nb_segments - 1)
			// 	current_segment_content_text += " ";

			current_segment_content.html(current_turn_utterance);

			// Si on est en mode liens, on ajoute également l'espace pour afficher l'étiquette de liens
			if (this.links_mode)
			{	
				var current_segment_link_label = $("<span class=\"segment_link_label\">&emsp;</span>");
				current_segment_container.append(current_segment_link_label);
			}

			// Retour à la ligne indiqué
			// if (current_segment.newline === 1)
			// {
			// 	if (segment_index > 0)
			// 		sentence_node.append($("<br/>"));
			// 	sentence_node.append($("<span class=\"segment_newline\">" + this.segment_newline_string + "</span>"));
			// }

		} else {
			// Tag the speaker in a <div>.
			var current_speaker_label = $("<span class=\"speaker_label\">" + this.corpus.getDocument(document_index).type + "</span>");
			current_speaker_container.append(current_speaker_label);
			var current_turn_utterance = this.corpus.getComment(document_index);

			// Puis on lui ajoute le segment en lui-meme
			var current_segment_content = $("<span class=\"segment_content\">");
			current_segment_container.append(current_segment_content);
			current_segment_content.html(current_turn_utterance);
		}

		// On place le contenant (<div> avec étiquette + contenu textuel) dans le noeud parent
		sentence_node.append(current_speaker_container);
		sentence_node.append(current_segment_container);
		sentence_node.append(current_explanation_container);

		// On crée un tableau de noeuds pour la meme phrase (à renvoyer)
		var sentences = {
			"nb_targets": target_indexes.length,
			"nb_links_targets": links_targets.length,
			"nodes": []
		}
		// On met à jour la liste des noeuds (cas du mode cible...)
		sentences.nodes = this.updateSentenceNodeForTargetMode(sentence_node, target_indexes, links_targets);

		// On renvoit le tableau de noeuds
		return sentences;
	};

	// Renvoit les boutons associés à une "phrase" sous forme de noeud jQuery
	this.getSentenceButtonsAsNode = function (document_index)
	{		
		// On crée le noeud contenant les boutons associés à une "phrase"
		var buttons_group = $("<div class=\"sentence_buttons\">");

		// TODO: Add annotable labels here.
		// if (this.corpus.isComment(document_index)) return buttons_group;
		// On y ajoute un bouton de validation
		// var validate_button = $("<button class=\"validate_sentence_button\" type=\"button\">" + _string("buttons", "validate_sentence", this.language) + "</button>");
		// validate_button.click(function (event) {
		// 	var segment_node = $(event.target).closest(".document").find(".target .segment_content")[0];
		// 	var target_number = this_validate_list.getTargetFromSegmentNode(segment_node);
		// 	this_validate_list.validateSentence(document_index, target_number);
		// });
		// buttons_group.append(validate_button);

		// ...un bouton d'annulation
		// var cancel_button = $("<button class=\"cancel_sentence_button\" type=\"button\">" + _string("buttons", "cancel_sentence", this.language) + "</button>");
		// cancel_button.click(function (event) {
		// 	var segment_node = $(event.target).closest(".document").find(".target .segment_content")[0];
		// 	var target_number = this_validate_list.getTargetFromSegmentNode(segment_node);

		// 	this_validate_list.cancelSentence(document_index, target_number);
		// });
		// buttons_group.append(cancel_button);


		var button_box = $("<div>")
		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=1_a>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 1, 'a'), "1_a") + "</button> </div>");
		button_box.append(validate_button);
		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=1_b>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 1, 'b'), "1_b") + "</button> </div>");
		button_box.append(validate_button);
		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=1_c>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 1, 'c'), "1_c") + "</button> </div>");
		button_box.append(validate_button);

		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=2_a>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 2, 'a'), "2_a") + "</button> </div>");
		button_box.append(validate_button);
		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=2_b>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 2, 'b'), "2_b") + "</button> </div>");
		button_box.append(validate_button);
		var validate_button = $("<div> <button class=\"validate_sentence_button\" type=\"button\", id=2_c>" + this.parseButtonLabelNULL(this.corpus.getTurnLabel(document_index, 2, 'c'), "2_c") + "</button> </div>");
		button_box.append(validate_button);

		// button_box.append($("<br>"));
		// validate_button.click(function (event) {
		// 	var segment_node = $(event.target).closest(".document").find(".segment_content")[0];
		// 	this_validate_list.openEditPopup(segment_node, 2);
		// });
		button_box.append(validate_button);

		buttons_group.append(button_box)
	
		return buttons_group;
	};

	this.parseButtonLabelNULL = function (label_name, id)
	{
		if (label_name == "NULL") return "label_" + id + "(" + label_name + ")";
		else return label_name;
	}

	// Renvoit le ou les noeuds représentant une phrase (un document) sous forme de tableau
	this.getSentenceNodes = function (document_index)
	{
		var sentence_nodes   = [];
		// var current_document = this.corpus.getDocument(document_index);

		// Pour chaque noeud de contenu (multiples si mode cible et cibles multiples), on duplique le document
		var current_sentences_content = this.getSentenceContentAsNodes(document_index);
		// STUB

		for (var node_index in current_sentences_content.nodes)
		{
			var current_content_node = current_sentences_content.nodes[node_index];
			// console.log(node_index, current_content_node);

			// On crée un noeud parent pour chaque occurence du document
			var current_sentence = $("<div class=\"document\">");

			if (node_index > 0)
				current_sentence.addClass("clone");

			// On lui associe une classe afin d'identifier le document source
			current_sentence.addClass("doc_" + document_index);

			// Ajout de casses utiles relatives à la présence ou à l'absence de cibles
			if (current_sentences_content.nb_targets > 0)
				current_sentence.addClass("has_target");
			else
				current_sentence.addClass("no_target");

			// Idem pour les liens cibles
			// if (current_sentences_content.nb_links_targets > 0)
			// 	current_sentence.addClass("has_link_target");
			// else
			// 	current_sentence.addClass("no_link_target");

			// On y ajoute les boutons de controle (associés à l'occurence de la "phrase" courante)
			if (!this.corpus.isComment(document_index)){
				var current_sentence_buttons = this.getSentenceButtonsAsNode(document_index);
				current_sentence.append(current_sentence_buttons);
			}

			var current_left_container = $("<div class=\"left_container\">");
			current_left_container.append($("<div class=\"numberCircle\">" + document_index + "</div>"));
			current_left_container.append(current_content_node);

			// On lui ajoute ensuite le contenu de l'occurence de la "phrase" courante
			current_sentence.append(current_left_container);


			// Maintenant on ajoute une image si existe XXXX
			// var image=this.corpus.getImage(document_index);
			// if (image!=null) current_sentence.append($('<img src="'+image+'" class="sentence_img"/>'));   

			// On ajoute finalement cette occurence à la liste
			sentence_nodes.push(current_sentence);
		}
		return sentence_nodes;
	};

	// Met à jour la liste à partir des "phrases" du corpus
	this.updateSentencesList = function ()
	{
		// On vide la liste actuelle
		this.documents.empty();

		var nb_documents = this.corpus.getNbDocuments();
		for (var document_index = 0; document_index < nb_documents; document_index++)
		{
			// if (document_index > 25) return;

			// On récupère les noeuds associés à chaque document
			var current_sentence_nodes = this.getSentenceNodes(document_index);
			// console.log(current_sentence_nodes)
			this.documents.append(current_sentence_nodes)

			// On les ajoute à la liste
			// for (var index in current_sentence_nodes)
			// 	this.documents.append(this.corpus.getDocument[index]);
		}
	};

	// Met à jour les phrases relatives à un document dont on connait l'indice
	this.updateSentence = function (document_index)
	{
		// On supprime les phrases associées à ce document
		$(".doc_" + document_index).remove();

		// On récupère les noeuds associés à ce document
		var current_sentence_nodes = this.getSentenceNodes(document_index);

		// On les ajoute à la liste, au bon emplacement
		var insertion_index    = document_index - 1;
		var last_inserted_node = null;

		console.log("indice insertion :", insertion_index);

		for (var index in current_sentence_nodes)
		{
			// Insertion après le dernier noeud inséré...
			if (last_inserted_node !== null)
				last_inserted_node.after(current_sentence_nodes[index]);
			
			// ...Ou insertion à un indice donné
			else
			{
				if (insertion_index < 0)
					this.documents.prepend(current_sentence_nodes[index]);
				else
				{
					// Si on est en mode cible, tous les documents ne sont pas nécessairement affichés
					if (this.target_mode)
					{
						// On recherche le premier document après lequel on peut insérer celui mis à jour
						var has_target_class = this.links_mode ? ".has_link_target" : ".has_target";
						while ($(".doc_" + insertion_index + has_target_class).length === 0)
						{
							insertion_index--;

							if (insertion_index < 0)
							{
								this.documents.prepend(current_sentence_nodes[index]);
								break;
							}
						}
					}
					
					$(".doc_" + insertion_index).last().after(current_sentence_nodes[index]);
				}
			}

			last_inserted_node = current_sentence_nodes[index];
		}
	};

	// --------------------------------------------------------------------------------------
	// Accès au corpus à partir de noeuds
	// --------------------------------------------------------------------------------------
	
	/****** NOTE *****
	* Lorsque le paramètre est "node", un noeud placé plus bas dans l'arbre est aussi accepté par la fonction.
	* Par exemple, un noeud de token peut permettre d'obtenir un indice de document.
	* 
	* Pour plus de simplicité, "node" peut etre aussi bien un noeud DOM qu'un noeud jQuery.
	*/

	// Renvoit l'ID du document parent du noeud
	this.getDocumentIndexFromSegmentNode = function (node)
	{
		return parseInt($(node).closest(".document")[0].className.match(/doc_[0-9]*/)[0].replace("doc_", ""));
	};

	// get the i-th turn from corpus
	this.getTurnNode = function (document_index)
	{
		return this.corpus.getDocument(document_index);
	};

	// Renvoit une référence vers un document à partir d'un noeud
	this.getDocumentFromSegmentNode = function (node)
	{
		// On récupère l'indice du document parent
		var document_index = this.getDocumentIndexFromSegmentNode(node);

		// On renvoit le document corresponsant à cet ID
		return this.corpus.getDocument(document_index);
	};

	// Renvoit l'indice du segment à partir d'un noeud DOM
	this.getSegmentIndexFromSegmentNode = function (node)
	{
		return parseInt($(node).closest(".segment")[0].className.match(/seg_[0-9]*/)[0].replace("seg_", ""));
	};

	// Renvoit une référence vers les données représentant un segment à partir d'un noeud DOM
	this.getSegmentFromSegmentNode = function (node)
	{
		// On récupère le document parent
		var segment_document = this.getDocumentFromSegmentNode(node);
		
		// On récupère le numéro du segment
		var segment_index = this.getSegmentIndexFromSegmentNode(node);

		return segment_document.segments[segment_index];
	};

	// Renvoit vrai si les deux noeuds sont ceux de deux segments voisins
	this.segmentsNodesAreNeighbours = function (segment_node_1, segment_node_2)
	{
		// On récupère le document parent de chaque segment
		var segment_1_document = this.getDocumentFromSegmentNode(segment_node_1);
		var segment_2_document = this.getDocumentFromSegmentNode(segment_node_2);

		// On vérifie que les deux parents soient identiques
		if (segment_1_document.id !== segment_2_document.id) return false;

		// S'ils le sont, on compare finalement les indices des segments
		var segment_1_index = this.getSegmentIndexFromSegmentNode(segment_node_1);
		var segment_2_index = this.getSegmentIndexFromSegmentNode(segment_node_2);

		if (segment_1_index === segment_2_index + 1) return true;
		if (segment_1_index === segment_2_index - 1) return true;

		return false;
	};

	// Renvoit vrai si deux noeuds sont ceux de tokens appartenant à un meme segment
	this.tokensAreInSameSegment = function (token_node_1, token_node_2)
	{
		return $(token_node_1)[0].parentNode === $(token_node_2)[0].parentNode;
	};

	// Renvoit l'indice du token à partir d'un noeud DOM
	this.getTokenIndexFromTokenNode = function (token_node)
	{
		return parseInt($(token_node)[0].className.match(/tok_[0-9]*/)[0].replace("tok_", ""));
	};

	// Renvoit le numéro de la cible à partir d'un noeud DOM
	this.getTargetFromSegmentNode = function (node)
	{
		var segment = null;
		if (this.links_mode)
			segment = $(node).closest(".link_target");
		else
			segment = $(node).closest(".target");

		if (segment.length === 0) return undefined;

		var matched_class = segment[0].className.match(/tar_[0-9]*/);
		if (! matched_class) return undefined;

		return parseInt(matched_class[0].replace("tar_", ""));
	};

	// Renvoit un tableau d'indices de segments étant l'origine de liens allant au segment dont on a le noeud
	this.getLinksOriginsFromSegmentNode = function (node)
	{
		var links_origins = [];

		var segment = $(node).closest(".linked");
		if (segment.length === 0) return links_origins;

		var matched_origins = segment[0].className.match(/destination_[0-9]*/g);
		if (! matched_origins) return links_origins;

		for (var index in matched_origins)
			matched_origins[index] = parseInt(matched_origins[index].replace("destination_", ""));

		return matched_origins;
	};

	// Renvoit un tableau d'indices de segments étant la destination de liens issus du segment dont on a le noeud
	this.getLinksDestinationsFromSegmentNode = function (node)
	{
		var links_destinations = [];

		var segment = $(node).closest(".linked");
		if (segment.length === 0) return links_destinations;

		var matched_destinations = segment[0].className.match(/origin_[0-9]*/g);
		if (! matched_destinations) return links_destinations;

		for (var index in matched_destinations)
			matched_destinations[index] = parseInt(matched_destinations[index].replace("origin_", ""));

		return matched_destinations;
	};

	// --------------------------------------------------------------------------------------
	// Action sur le corpus
	// --------------------------------------------------------------------------------------
	
	// Cette fonction permet d'appliquer une fonction en sauvegardant le corpus, et en mettant éventuellement à jour l'affichage
	this.apply = function (function_to_apply, update_display, document_to_update_index)
	{
		// On sauvegarde le corpus actuel
		this.corpus.saveCurrentVersion();

		// On appelle la fonction concernée
		function_to_apply();

		// On met éventuellement à jour l'affichage
		// On peut spécifier l'indice du document à mettre à jour (en option)
		if (update_display)
			this.updateDisplay(document_to_update_index);
	};

	// --------------------------------------------------------------------------------------
	// Historique des modifications
	// --------------------------------------------------------------------------------------
	
	// Annule la dernière action effectuée
	this.undo = function ()
	{
		var success = this.corpus.restorePreviousVersion();
		if (! success)
		{
			console.log("Echec lors de la restauration d'une ancienne version.");
			return;
		}

		this_validate_list.updateDisplay();
	};

	// Gestion des raccourcis clavier pour l'historique des modifcations
	this.handleHistoryKeyboardShortcuts = function ()
	{
		// Codes de certaines touches du clavier
		var z_keycode = 90;

		$(document).keydown(function (event) {
			// La combinaison CTRL + Z permet d'annuler la dernière action
			if (event.ctrlKey && event.which === z_keycode)
				this_validate_list.undo();
		});
	};

	// --------------------------------------------------------------------------------------
	// Validation/annulation de phrases
	// --------------------------------------------------------------------------------------

	// NOTE UTILE :
	// Le paramètre nth_target peut-etre omis (utile en cas de multiples occurences d'une meme phrase en mode cible)
	
	// Validation paramétrée des segments/étiquettes
	this.validateSegmentsWithoutSavingOrUpdating = function (document_index, nth_target)
	{
		// Selon le paramétrage, on valide l'étiquettage et/ou la segmentation
		if (this.validate_segments && this.validate_labels)
		{
			this.corpus.setDocumentAsGold(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);
			return;
		}

		if (this.validate_segments)
			this.corpus.setDocumentsSegmentsAsGold(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);

		if (this.validate_labels)
			this.corpus.setDocumentsLabelsAsGold(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);
	};

	// Validation paramétrée des liens/étiquettes de liens
	this.validateLinksWithoutSavingOrUpdating = function (document_index, nth_target)
	{
		// Selon le paramétrage, on valide le lien et/ou son étiquette
		if (this.validate_links && this.validate_links_labels)
		{
			this.corpus.setLinksAsGold(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);
			return;
		}

		if (this.validate_links)
			this.corpus.setLinksStatusAsGold(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);

		if (this.validate_links_labels)
			this.corpus.setLinksLabelsStatusAsGold(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);
	};

	// Validation paramétrée suivant le mode
	this.validateSentenceWithoutSavingOrUpdating = function (document_index, nth_target)
	{
		if (this.links_mode)
			this.validateLinksWithoutSavingOrUpdating(document_index, nth_target);
		else
			this.validateSegmentsWithoutSavingOrUpdating(document_index, nth_target);
	};

	// Validation paramétrée d'une phrase avec sauvegarde et mise à jour de l'affichage
	this.validateSentence = function (document_index, nth_target)
	{
		this.apply(function () {
			this_validate_list.validateSentenceWithoutSavingOrUpdating(document_index, nth_target);
		}, true, document_index);
	};

	// Validation paramétrée de toutes les phrases avec sauvegarde et mise à jour de l'affichage
	this.validateAllSentences = function ()
	{
		this.apply(function () {
			var documents = this_validate_list.corpus.getDocuments();
			for (var document_index in documents)
				this_validate_list.validateSentenceWithoutSavingOrUpdating(document_index);
		}, true);
	};

	// Annulation paramétrée des segments/étiquettes
	this.cancelSegmentsWithoutSavingOrUpdating = function (document_index, nth_target)
	{
		// Selon le paramétrage, on signale l'étiquettage et/ou la segmentation comme érronée
		if (this.cancel_segments && this.cancel_labels)
		{
			this.corpus.setDocumentAsCanceled(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);
			return;
		}

		if (this.cancel_segments)
			this.corpus.setDocumentsSegmentsAsCanceled(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);

		if (this.cancel_labels)
			this.corpus.setDocumentsLabelsAsCanceled(document_index, this.ignore_priority_zero, this.target_mode, this.only_edit_segments_hypothesis, this.only_edit_labels_hypothesis, nth_target);
	};

	// Annulation paramétrée des liens/étiquettes de liens
	this.cancelLinksWithoutSavingOrUpdating = function (document_index, nth_target)
	{
		// Selon le paramétrage, on valide le lien et/ou son étiquette
		if (this.cancel_links && this.cancel_links_labels)
		{
			this.corpus.setLinksAsCanceled(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);
			return;
		}

		if (this.cancel_links)
			this.corpus.setLinksStatusAsCanceled(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);

		if (this.cancel_links_labels)
			this.corpus.setLinksLabelsStatusAsCanceled(document_index, this.target_mode, this.only_edit_links_hypothesis, this.only_edit_links_labels_hypothesis, nth_target);
	};

	// Annulation paramétrée suivant le mode
	this.cancelSentenceWithoutSavingOrUpdating = function (document_index, nth_target)
	{	
		if (this.links_mode)
			this.cancelLinksWithoutSavingOrUpdating(document_index, nth_target);
		else
			this.cancelSegmentsWithoutSavingOrUpdating(document_index, nth_target);
	};

	// Annulation paramétrée d'une phrase avec sauvegarde et mise à jour de l'affichage
	this.cancelSentence = function (document_index, nth_target)
	{
		this.apply(function () {
			this_validate_list.cancelSentenceWithoutSavingOrUpdating(document_index, nth_target);
		}, true, document_index);
	};

	// Annulation paramétrée de toutes les phrases avec sauvegarde et mise à jour de l'affichage
	this.cancelAllSentences = function ()
	{
		this.apply(function () {
			var documents = this_validate_list.corpus.getDocuments();
			for (var document_index in documents)
				this_validate_list.cancelSentenceWithoutSavingOrUpdating(document_index);
		}, true);
	};

	// --------------------------------------------------------------------------------------
	// Phrase sélectionnée
	// --------------------------------------------------------------------------------------

	// Mise à jour la phrase sélectionnée
	this.updateSelectedSentence = function ()
	{
		console.log("XXXX selected sentence="+this.selected_sentence);

		// On retire à la phrase sélectionnée précédente sa classe de phrase mise en avant
		$(".selected_sentence").removeClass("selected_sentence");

		// Si l'indice mémorisé excède la taille de la liste (passage du mode cible avec duplications en mode normal par exemple), on le diminue
		var visible_sentences = $(".document");
		var sentence_index 	  = Math.min(this.selected_sentence, visible_sentences.length - 1);

		// On récupère le noeud de la nouvelle phrase sélectionnée et lui attribut la classe concernée
		var current_sentence_node = visible_sentences.eq(sentence_index);
		current_sentence_node.addClass("selected_sentence");
		console.log("  sentence_index="+sentence_index);

	};

	// Passage à la phrase précédente (selon une propriété de l'instance, en cycle avec la fin ou non)
	this.goToPreviousSentence = function ()
	{
	console.log("GO to previous sentence: "+this.selected_sentence);
		if (this.selected_sentence === 0)
		{
			if (this.loop_while_browsing_sentences)
				this.selected_sentence = $(".document").length - 1;
		}
		else if (this.selected_sentence > $(".document").length - 1)
			this.selected_sentence = $(".document").length - 2;
		else
			this.selected_sentence--;

		window.scrollBy(0, - ($(".selected_sentence").height() + 25));
	};

	// Passage à la phrase suivante (selon une propriété de l'instance, en cycle avec le début ou non)
	this.goToNextSentence = function ()
	{
	console.log("GO to next sentence: "+this.selected_sentence);
		if (this.selected_sentence >= $(".document").length - 1)
		{
			if (this.loop_while_browsing_sentences)
				this.selected_sentence = 0;
			else
				{
				this.selected_sentence = $(".document").length - 1;
				}
		}
		else
			this.selected_sentence++;

		window.scrollBy(0, $(".selected_sentence").height() + 25);
	//DrawlinkScrolleft=0; // drawlink window at the beginning
	};

	// Passage à la phrase précédente avec mise à jour de l'affichage
	this.goToPreviousSentenceAndUpdateDisplay = function ()
	{
		this.goToPreviousSentence();
		//this.updateSelectedSentence();
		this.updateDisplay();
	};

	// Passage à la phrase suivante avec mise à jour de l'affichage
	this.goToNextSentenceAndUpdateDisplay = function ()
	{
		this.goToNextSentence();
		//this.updateSelectedSentence();
		this.updateDisplay();
	};

	// Gestion des raccourcis clavier relatifs aux phrases
	this.handleSentencesRelatedKeyboardShortcuts = function ()
	{
		// Codes de certaines touches du clavier
		var left_arrow_keycode  = 37;
		var right_arrow_keycode = 39;
		var v_keycode 			= 86;
		var c_keycode 			= 67;

		$(document).keydown(function (event) {

			// Les flèches haut et bas permettent de passer d'une phrase à l'autre
			if (event.which === right_arrow_keycode)
				this_validate_list.goToNextSentenceAndUpdateDisplay();

			if (event.which === left_arrow_keycode)
				this_validate_list.goToPreviousSentenceAndUpdateDisplay();

			// On récupère des informations utiles sur le segment courant
			var current_sentence_segment_node = $(".selected_sentence .segment");

			// Si aucune phrase n'est sélectionnée, on ne fait rien
			if (current_sentence_segment_node.length === 0) return;
			
			// On isole éventuellement une cible
			var current_sentence_target = null;
			if (this_validate_list.target_mode)
				if (this_validate_list.links_mode)
					current_sentence_target = $(".selected_sentence .link_target")[0];
				else
					current_sentence_target = $(".selected_sentence .target")[0];

			var document_index = this_validate_list.getDocumentIndexFromSegmentNode(current_sentence_segment_node);
			var target_number  = this_validate_list.getTargetFromSegmentNode(current_sentence_target);
			
			// La touche V permet de Valider la phrase sélectionnée
			if (event.which === v_keycode)
				this_validate_list.validateSentence(document_index, target_number);

			// La touche C permet d'annuler (Cancel) la phrase sélectionnée
			if (event.which === c_keycode)
				this_validate_list.cancelSentence(document_index, target_number);
		});
	};

	// Gestion d'un clic sur une phrase
	this.handleClicksOnSentences = function ()
	{
		this.documents.click(function (event) {
			console.log("INFO handleClicksOnSentences");
			if ( this_validate_list.validate_sentence_by_sentence ) return;
			var clicked_sentence = $(event.target).closest(".document");
			if (clicked_sentence.length === 0) return;

			// On récupère l'indice du document lié à la phrase cliquée
			var document_index = clicked_sentence.index(".document");

			// On signale la phrase cliquée comme phrase sélectionnée
			if (document_index!=-1) this_validate_list.selected_sentence = document_index;
			else this_validate_list.selected_sentence++;
			// console.log("OOOO selected sentence="+this_validate_list.selected_sentence);
			this_validate_list.updateSelectedSentence();
		});
	};

	// --------------------------------------------------------------------------------------
	// Mode édition
	// --------------------------------------------------------------------------------------

	// Mise à jour de la phrase éditable (le paramètre peut etre omis, et est alors considéré comme faux)
	this.updateEditableSentence = function (exit_edit_mode)
	{
		// On retire le statut de phrase éditable à celle le possédant actuellement
		$(".editable").removeClass("editable");

		// Si on n'est pas en mode cible, aucune phrase ne peut passer en mode édition (toutes le sont)
		if (! this.target_mode)
		{
			this.editable_sentence = 0;
			this.edit_mode_is_open = false;
			return;
		}

		// On récupère la phrase concernée
		var editable_sentence = $(".document").eq(this.editable_sentence);

		// On entre ou sort du mode édition (suivant le paramètre)
		if (exit_edit_mode)
			this.edit_mode_is_open = false;
		else
		{
			editable_sentence.addClass("editable");
			this.edit_mode_is_open = true;
		}
	};

	// Gestion d'un double clic sur une phrase
	this.handleDoubleClicksOnSentences = function ()
	{
		this.documents.dblclick(function (event) {
			// Si on n'est pas en mode cible, on ne fait rien
			if (! this_validate_list.target_mode) return;

			// On identifie la phrase cliquée et met à jour l'indice mémorisé
			var clicked_sentence = $(event.target).closest(".document");
			if (clicked_sentence.length === 0) return;

			var document_index = clicked_sentence.index();

			// Si on reclique sur une phrase déjà en mode édition, on sort de ce mode, sinon on y entre
			var exit_edit_mode = false;
			if (clicked_sentence.hasClass("editable"))
				exit_edit_mode = true;

			this_validate_list.editable_sentence = document_index;
			this_validate_list.updateEditableSentence(exit_edit_mode);
		});
	};

	// --------------------------------------------------------------------------------------
	// Distance des segments par rapport aux cibles
	// --------------------------------------------------------------------------------------

	// Fonction récursive fixant la distance des segments par rapport aux cibles
	this.setSegmentsDistancesToTargetsRecursive = function (segment, distance)
	{
		if ((! segment) || segment.length === 0) return;

		// Le segment ne doit pas etre une cible
		if (this.links_mode 	&& segment.hasClass("link_target")) return;
		if ((! this.links_mode) && segment.hasClass("target")) 		return;

		var segment_distance_to_target = segment[0].className.match(/target_dist_[0-9]*/);
		if (segment_distance_to_target)
		{
			segment_distance_to_target = parseInt(segment_distance_to_target[0].replace("target_dist_", ""));

			// Si on a déjà fixé une distance plus petite, on ne l'augmente pas
			if (segment_distance_to_target <= distance) return;
		}

		// On fixe la distance (par rapport) aux cibles du segment
		segment.addClass("target_dist_" + distance);

		// On met à jour la distance maximale atteinte (but pratique)
		this.segment_max_distance_to_targets = Math.max(this.segment_max_distance_to_targets, distance);

		// On appelle cette fonction récursivement sur les voisins du segment courant
		this.setSegmentsDistancesToTargetsRecursive(segment.prev(), distance + 1);
		this.setSegmentsDistancesToTargetsRecursive(segment.next(), distance + 1);
	};

	// Met à jour les distances de tous les segments par rapports aux cibles
	this.updateSegmentsDistancesToTargets = function ()
	{
		// On fixe récursivement la distance des segments par rapport aux cibles
		var targets = this.links_mode   ?
					  $(".link_target") :
					  $(".target") 		;

		targets.each(function () {
			// On récupère les voisins
			var previous_segment = $(this).prev();
			var next_segment 	 = $(this).next();

			// Si on est en mdoe cible, on va chercher les voisins dans les contextes adjacents aux cibles
			if (this_validate_list.target_mode)
			{
				previous_segment = previous_segment.children().last();
				next_segment 	 = next_segment.children().first();
			}

			// On commence par leur appliquer une distance de 1, et l'étend à leurs voisins par récursion
			this_validate_list.setSegmentsDistancesToTargetsRecursive(previous_segment, 1);
			this_validate_list.setSegmentsDistancesToTargetsRecursive(next_segment, 1);
		});
	};

	// Cache tous les segments étant trop éloignés des cibles
	this.hideFarSegments = function ()
	{
		// On ne fait rien si l'option n'est pas activée
		if (! this.hide_far_segments) return;

		$(".segment").each(function (index) {
			var current_segment = $(this);

			// On remet à zéro la liste des segments masqués
			current_segment.removeClass("too_distant");

			// Si le document n'a pas de cible on ne fait rien
			var current_segment_document = current_segment.closest(".document");

			if (this_validate_list.links_mode 	  && current_segment_document.hasClass("no_link_target")) return;
			if ((! this_validate_list.links_mode) && current_segment_document.hasClass("no_target")) 	  return;

			// Si le segment est une cible, on ne fait rien
			if (this_validate_list.links_mode 	  && current_segment.hasClass("link_target")) return;
			if ((! this_validate_list.links_mode) && current_segment.hasClass("target")) 	  return;

			// On récupère la distance du segment (par rapport à la plus proche cible)
			var current_segment_distance = parseInt(current_segment[0].className.match(/target_dist_[0-9]*/)[0].replace("target_dist_", ""));

			// On cache le segment seulement si la distance est excessive
			var maximum_distance = Math.max(1, this_validate_list.close_segment_max_distance);
			if (current_segment_distance > maximum_distance)
				current_segment.addClass("too_distant");
		});
	};

	// Met à jour les distances des segments par rapport aux cibles et masque celles distantes
	this.onlyDisplayCloseSegments = function ()
	{
		// Si l'option n'est pas activée, on ne fait rien
		if (! this.hide_far_segments) return;

		this.updateSegmentsDistancesToTargets();
		this.hideFarSegments();
	};

	// --------------------------------------------------------------------------------------
	// Sélection de texte dans les segments
	// --------------------------------------------------------------------------------------

	// Ecoute la sélection de texte dans un segment (subdivision du segment)
	this.handleSegmentsTextSelection = function ()
	{
		// Si on est en mode liens, on n'a pas cette possibilité !
		if (this.links_mode) return;

		this.documents.mouseup(function (event) {
			// On récupère le texte éventuellement sélectionné
			var selection = window.getSelection();

			// Si rien n'est sélectionné, on ne fait rien
			if (selection.isCollasped) return;

			// Si le popup d'édition est affiché, on ne fait rien
			if (this_validate_list.edit_popup_is_displayed) return;

			// Si l'option est activée, la touche CTRL doit etre enfoncée pour subdiviser, sinon on ne fait rien
			//
			if (this_validate_list.hold_ctrl_to_subdivide_segments)
				if ((! event.ctrlKey) && (! event.altKey)) return;
			// On récupère les noeuds de départ et de fin de la sélection
			var selection_start_node = $(selection.anchorNode);
			var selection_end_node 	 = $(selection.focusNode);

			// On part du principe que tout token sélectionné, MEME PARTIELLEMENT, sera contenu par le nouveau segment
			// On vérifie que la sélection est bien celle de deux tokens (éventuellement un seul token)
			var selection_first_token = selection_start_node.closest(".token");
			var selection_last_token  = selection_end_node.closest(".token");

			if (selection_first_token.length === 0 || selection_last_token.length === 0) return;

			// On vérifie alors que les tokens sont ceux d'un meme segment
			if (! this_validate_list.tokensAreInSameSegment(selection_first_token, selection_last_token)) return;

			// On isole l'id du document parent, l'indice du segment, ainsi que les indices des deux tokens
			var document_index = this_validate_list.getDocumentIndexFromSegmentNode(selection_first_token);
			var segment_index  = this_validate_list.getSegmentIndexFromSegmentNode(selection_first_token)

			var first_token_index = this_validate_list.getTokenIndexFromTokenNode(selection_first_token);
			var last_token_index  = this_validate_list.getTokenIndexFromTokenNode(selection_last_token);

			// Si on sélectionne de droite à gauche, on doit inverser l'ordre des indices !
			if (last_token_index < first_token_index)
			{
				var first_token_index_copy = first_token_index;
				first_token_index 		   = last_token_index;
				last_token_index 		   = first_token_index_copy;
			}

			// On découpe en sous-segments le segment concerné
			this_validate_list.apply(function () {
				this_validate_list.corpus.extractSubsegment(document_index, segment_index, first_token_index, last_token_index);
			}, true, document_index);
		});
	};

	// --------------------------------------------------------------------------------------
	// Menu popup d'édition (étiquettes et segmentation)
	// --------------------------------------------------------------------------------------

	// Renvoit la liste des étiquettes du popup d'édition
	this.getEditPopupLabelsList = function (document_index, segment, list_index)
	{
		console.log(document_index, list_index)
		var allowed_labels = this.corpus.getLabelsListByType(list_index);

		// On écrit une fonction pour ajouter un handler de clic sur les éléments de la liste
		function handleClickOnListElement (list_element, label)
		{
			list_element.click(function (event) {
				this_validate_list.apply(function () {
					// On met à jour les données du corpus
					// TODO: add label_2
					if (list_index == "1_a") segment.label_1_a	= label;
					if (list_index == "1_b") segment.label_1_b	= label;
					if (list_index == "1_c") segment.label_1_c	= label;
					if (list_index == "2_a") segment.label_2_a	= label;
					if (list_index == "2_b") segment.label_2_b	= label;
					if (list_index == "2_c") segment.label_2_c	= label;
					segment.timestamp  = Date.now();
					segment.status_lab = "G";
					segment.status_seg = "G"; /* maintenant on valide la seg des qu'on valide le label */
					segment.author=this_validate_list.corpus.getAuthor(); /* on rajoute les authors au niveau des segments */
					// On ferme le popup
					this_validate_list.closeEditPopup();
				}, true, document_index);
			});
		}

		// On crée la liste des étiquettes
		var labels_list = $("<ul class=\"labels_list\">");

		for (var label_index in allowed_labels)
		{
			var current_label = allowed_labels[label_index];
			var current_label_list_element = $("<li style=\"text-align: left\">" + current_label + "</li>");
			labels_list.append(current_label_list_element);

			// On met en avant le label courant du segment concerné
			if (current_label == segment.label)
				current_label_list_element.addClass("selected_label");

			// Si une étiquette est cliquée, on ajoute un handler (voir fonction plus haut)
			handleClickOnListElement(current_label_list_element, current_label);
		}

		return labels_list;
	};

	// Renvoit les boutons du popup d'édition
	this.getEditPopupButtons = function (segment_node)
	{
		var buttons = [];

		var document_index = this_validate_list.getDocumentIndexFromSegmentNode(segment_node);
		var segment_index  = this_validate_list.getSegmentIndexFromSegmentNode(segment_node);

		// Ajout de token par la gauche (si ce n'est pas le premier segment)
		if (! $(segment_node).closest(".segment").hasClass("seg_0"))
		{
			var merge_left_button = $("<button id=\"merge_left_segment_button\" type=\"button\" title=\"" + _string("tooltips", "merge_left_segment", this.language) + "\">" + _string("buttons", "merge_left_segment", this.language) + "</button>");
			
			merge_left_button.click(function (event) {
				this_validate_list.apply(function () {
					// On fusionne le segment avec celui à sa gauche
					this_validate_list.corpus.mergeWithLeftSegment(document_index, segment_index);

					//this_validate_list.closeEditPopup();
				}, true, document_index);
			});

			buttons.push(merge_left_button);
		}

		// On lui ajoute un bouton de validation de la segmentation
		// var validate_segmentation_button = $("<button id=\"validate_segmentation_button\" type=\"button\" title=\"" + _string("tooltips", "validate_segmentation", this.language) + "\">" + _string("buttons", "validate_segmentation", this.language) + "</button>");
		
		// validate_segmentation_button.click(function (event) {
		// 	this_validate_list.apply(function () {
		// 		// On change le statut de segmentation de ce segment
		// 		var segment = this_validate_list.getSegmentFromSegmentNode(segment_node);

		// 		segment.status_seg = "G";
		// 		segment.timestamp  = Date.now();
		// 		segment.author=this_validate_list.corpus.getAuthor(); /* on rajoute les authors au niveau des segments */

		// 		this_validate_list.closeEditPopup();
		// 	}, true, document_index);
		// });

		// buttons.push(validate_segmentation_button);

		// On lui ajoute un bouton d'annulation de la segmentation
		// var cancel_segmentation_button = $("<button id=\"cancel_segmentation_button\" type=\"button\" title=\"" + _string("tooltips", "cancel_segmentation", this.language) + "\">" + _string("buttons", "cancel_segmentation", this.language) + "</button>");
		
		// cancel_segmentation_button.click(function (event) {
		// 	this_validate_list.apply(function () {
		// 		// On change le statut de segmentation de ce segment
		// 		var segment = this_validate_list.getSegmentFromSegmentNode(segment_node);

		// 		segment.status_seg = "C";
		// 		segment.timestamp  = Date.now();

		// 		this_validate_list.closeEditPopup();
		// 	}, true, document_index);
		// });

		// buttons.push(cancel_segmentation_button);

		// Ajout de token par la droite (si ce n'est pas le dernier segment)
		var segment_document = this.getDocumentFromSegmentNode(segment_node);
		if (! $(segment_node).closest(".segment").hasClass("seg_" + 0))
		{
			var merge_right_button = $("<button id=\"merge_right_segment_button\" type=\"button\" title=\"" + _string("tooltips", "merge_right_segment", this.language) + "\">" + _string("buttons", "merge_right_segment", this.language) + "</button>");
			
			merge_right_button.click(function (event) {
				this_validate_list.apply(function () {
					// On fusionne le segment avec celui à sa droite
					this_validate_list.corpus.mergeWithRightSegment(document_index, segment_index);

					//this_validate_list.closeEditPopup();
				}, true, document_index);
			});

			buttons.push(merge_right_button);
		}

		return buttons;
	};

	// Crée et renvoit le popup d'édition
	this.createNewEditPopup = function (segment_node, list_index)
	{
		// Si un popup d'id edit_popup existe, on le supprime
		$("#edit_popup").remove();

		var document_index = this.getDocumentIndexFromSegmentNode(segment_node);
		// var segment 	   = this.getSegmentFromSegmentNode(segment_node);
		var segment = this.getTurnNode(document_index);

		// On crée un nouveau popup
		var new_popup = $("<div class=\"popup\" id=\"edit_popup\">");

		// On récupère la liste des étiquettes et l'ajoute au popup
		var labels_list = this.getEditPopupLabelsList(document_index, segment, list_index);
		new_popup.append(labels_list);

		// On récupère les boutons du popup
		var buttons = this.getEditPopupButtons(segment_node);
		for (var index in buttons)
			new_popup.append(buttons[index]);

		return new_popup;
	};

	// Crée et affiche le popup d'édition
	this.openEditPopup = function (segment_node, x, y, list_index)
	{
        console.log("openEditPopup");

		// On crée un nouveau popup
		var new_popup = this.createNewEditPopup(segment_node, list_index);

		// On le positionne
		var windows_width = $(window).width();
		new_popup.css("top", y + ($(segment_node).height() * 1.5));
		// new_popup.css("max-width", Math.floor(Math.abs((windows_width / 2) - x)) + 200 /* à améliorer ? */);

		if (x < (0.5 * windows_width))
			new_popup.css("left", x);
		else
			new_popup.css("right", windows_width - x);

		// On l'affiche
		this.main_node.append(new_popup);
		//new_popup.show(50); 
		new_popup.css("display","inline");

		this.edit_popup_is_displayed = true;
	};

	// Ferme le popup d'édition
	this.closeEditPopup = function ()
	{
		if (! this.edit_popup_is_displayed) return;
        console.log("closeEditPopup"); 

		var edit_popup = $("#edit_popup");
		//edit_popup.hide(50);
		edit_popup.css("display","none");
		//edit_popup.remove();
		this.edit_popup_is_displayed = false;
	};

	// --------------------------------------------------------------------------------------
	// Menu popup de liens
	// --------------------------------------------------------------------------------------

	// Renvoit un élément représentant un lien (+ boutons, etc) pour le popup de liens
	this.getLinksPopupLinkElement = function (document_index, segment_index, link)
	{
		var links_labels   = this.corpus.getLinksLabelsList();
		var link_container = $("<div class=\"link\">");
		var linked_segment_index   = link.orig === segment_index ? link.dest : link.orig;

		// Mise en avant de l'autre segment du lien au survol
		link_container.mouseenter(function (event) {
			$(".doc_" + document_index + " .seg_" + linked_segment_index).addClass("link_other_end");
		});

		link_container.mouseleave(function (event) {
			$(".link_other_end").removeClass("link_other_end");
		});

		// On ajoute certaines classes au noeud du lien suivant son état
		if (link.label != "NULL")
			link_container.addClass("labelled");

		if (link.status_link == "G")
			link_container.addClass("link_gold");
		if (link.status_link == "C")
			link_container.addClass("link_canceled");
		if (link.status_label == "G")
			link_container.addClass("label_gold");
		if (link.status_label == "C")
			link_container.addClass("label_canceled");

		// Contenu du segment lié
		var segment_content 	   = this_validate_list.corpus.getSegmentContent(document_index, linked_segment_index).replace("<", "&lt;").replace(">", "&gt;");
		var linked_segment_content = $("<span class=\"linked_segment_content\" title=\"" + segment_content + "\">" + segment_content + "</span>");

		link_container.append(linked_segment_content);
		
		// Boutons de validation/annulation du statut d'un lien
		var validate_link_status_button = $("<button class=\"validate_link_status_button\" title=\"" + _string("tooltips", "validate_link_status", this.language) + "\">" + _string("buttons", "validate_link_status", this.language) + "</button>");

		validate_link_status_button.click(function (event) {
			this_validate_list.apply(function() {
				// On récupère l'étiquette dans la liste
				var selected_label = $(event.target).closest(".link").find(".link_labels option:selected").text();

				// On valide les status du lien suivant le paramétrage
				if (this_validate_list.validate_links)
					link.status_link  = "G";
				if (this_validate_list.validate_links_labels)
					link.status_label = "G";

				link.label 	   = selected_label;
				link.timestamp = Date.now();
				link.author=this_validate_list.corpus.getAuthor();

				this_validate_list.updateLinksPopup();
			}, false);
		});

		link_container.append(validate_link_status_button);

		var cancel_link_status_button = $("<button class=\"cancel_link_status_button\" title=\"" + _string("tooltips", "cancel_link_status", this.language) + "\">" + _string("buttons", "cancel_link_status", this.language) + "</button>");

		cancel_link_status_button.click(function (event) {
			this_validate_list.apply(function() {
				// On annule les status du lien suivant le paramétrage
				if (this_validate_list.cancel_links)
					link.status_link  = "C";
				if (this_validate_list.cancel_links_labels)
					link.status_label = "C";

				link.timestamp = Date.now();

				this_validate_list.updateLinksPopup();
			}, false);
		});

		link_container.append(cancel_link_status_button);

		// Liste des étiquettes
		var link_labels_list = $("<select class=\"link_labels\">");

		for (var index in links_labels)
		{
			var current_link_label = links_labels[index];

			var current_label_option = $("<option value=\"" + current_link_label + "\">" + current_link_label + "</option>");
			if (link.label == current_link_label)
				current_label_option.prop("selected", true);
			
			link_labels_list.append(current_label_option);
		}

		link_container.append(link_labels_list);

		// Bouton de suppression de lien
		var remove_link_button = $("<button class=\"remove_link_button\" title=\"" + _string("tooltips", "delete_link", this.language) + "\">" + _string("buttons", "remove_link", this.language) + "</button>");

		remove_link_button.click(function (event) {
			this_validate_list.apply(function() {
				// On supprime ce lien
				this_validate_list.corpus.removeLink(document_index, link);

				this_validate_list.closeLinksPopup();
			}, true, document_index);
		});

		link_container.append(remove_link_button);

		// On renvoit le conteneur du lien
		return link_container;
	};

	// Renvoit la liste des liens pour le popup de liens
	this.getLinksPopupLinksList = function (document_index, segment_node)
	{
		var parent_document = this.corpus.getDocument(document_index);
		var segment_index   = this.getSegmentIndexFromSegmentNode(segment_node);
		var links_labels 	= this.corpus.getLinksLabelsList();

		// On récupère les (indices des) liens relatifs à ce segment
		var links_from_segment = this.corpus.getMatchingLinks(document_index, {"orig": segment_index});
		var links_to_segment   = this.corpus.getMatchingLinks(document_index, {"dest": segment_index});

		// On crée une listes de liens
		var links_container = $("<div id=\"links\">");

		// Suivant le paramétrage de l'instance, on liste des liens entrants ou sortants de ce segments
		if (this.display_links_destinations && links_from_segment.length > 0)
		{
			var links_from_segment_container = $("<div id=\"links_from_segment_container\">");
			links_from_segment_container.append($("<h3>" + _string("titles", "links_to_other_segments", this.language) + "</h3>"));

			// On ajoute les liens issus de ce segment
			for (var index in links_from_segment)
			{
				var current_link_element = this.getLinksPopupLinkElement(document_index, segment_index, links_from_segment[index]);
				links_from_segment_container.append(current_link_element);
			}

			links_container.append(links_from_segment_container);
		}

		if (this.display_links_origins && links_to_segment.length > 0)
		{
			var links_to_segment_container = $("<div id=\"links_to_segment_container\">");
			links_to_segment_container.append($("<h3>" + _string("titles", "links_from_other_segments", this.language) + "</h3>"));

			// On ajoute les liens allant à ce segment
			for (var index in links_to_segment)
			{
				var current_link_element = this.getLinksPopupLinkElement(document_index, segment_index, links_to_segment[index]);
				links_to_segment_container.append(current_link_element);
			}

			links_container.append(links_to_segment_container);
		}

		return links_container;
	};

	// Renvoit le(s) bouton(s) du popup de liens
	this.getLinksPopupButtons = function (document_index, segment_node)
	{
		var links_labels = this.corpus.getLinksLabelsList();
		var buttons 	 = [];
		
		var parent_document = this.corpus.getDocument(document_index);
		var segment_index   = this.getSegmentIndexFromSegmentNode(segment_node);

		// Ajout d'un nouveau lien
		var new_link_button = $("<button id=\"new_link_button\" type=\"button\" title=\"" + _string("tooltips", "new_link", this.language) + "\">" + _string("buttons", "new_link", this.language) + "</button>");
		
		new_link_button.click(function (event) {
			this_validate_list.link_is_beeing_added = true;

			// On met en avant le segment cliqué en tant que source d'un nouveau lien
			$(segment_node).closest(".segment").addClass("new_link_origin");

			// On récupère l'étiquette du lien à créer
			var selected_label = $(event.target).siblings(".link_labels").find("option:selected").text();

			// On ferme le popup (sinon le popup masque des parties de phrase !)
			this_validate_list.closeLinksPopup();

			// Si on clique sur un second segment du meme document, on crée un lien
			// Si le clic est fait ailleurs, on ne fait rien
			setTimeout(function () {
				$("body").click(function (event) {
					$("body").off("click");
					this_validate_list.link_is_beeing_added = false;

					// Le segment d'origine n'est plus mis en avant
					$(".new_link_origin").removeClass("new_link_origin");

					// Le clic doit etre fait dans le meme document
					if ($(event.target).closest(".doc_" + document_index).length === 0) return;
					
					// Il doit etre fait sur un segment
					var clicked_segment_content = $(event.target).closest(".segment_content");
					if (clicked_segment_content.length === 0) return;

					// Le segment cliqué doit etre different de celui depuis lequel on souhaite créer un lien
					var clicked_segment_index = this_validate_list.getSegmentIndexFromSegmentNode(clicked_segment_content);
					if (segment_index === clicked_segment_index) return;

					// On ajoute le lien
					this_validate_list.apply(function () {
						this_validate_list.corpus.addLink(document_index, {
							"orig": segment_index,
							"dest": clicked_segment_index,
							"status_link": "G",
							"label": selected_label,
							"author": this_validate_list.corpus.getAuthor()
						});
					}, true, document_index);
				});
			}, 20);
		});

		buttons.push(new_link_button);

		// Liste des étiquettes pour le nouveau lien
		var link_labels_list = $("<select class=\"link_labels\">");

		for (var index in links_labels)
		{
			var current_link_label = links_labels[index];

			var current_label_option = $("<option value=\"" + current_link_label + "\">" + current_link_label + "</option>");
			if (current_link_label == this.last_segment_link_label)
				current_label_option.prop("selected", true);
			
			link_labels_list.append(current_label_option);
		}

		// Lorsqu'on change de label, on met à jour le dernier label sélectionné
		link_labels_list.change(function (event) {
			var selected_label = $(event.target).closest("#links_popup").children(".link_labels").find("option:selected").text();
			this_validate_list.last_segment_link_label = selected_label;
		});

		buttons.push(link_labels_list);

		return buttons;
	};

	// Crée et renvoit un popup de modification d'étiquette
	this.createNewLinksPopup = function (segment_node)
	{
		// Si un popup d'id edit_popup existe, on le supprime
		$("#links_popup").remove();

		var document_index = this.getDocumentIndexFromSegmentNode(segment_node);
		var segment 	   = this.getSegmentFromSegmentNode(segment_node);

		// On crée un nouveau popup
		var new_popup = $("<div class=\"popup\" id=\"links_popup\">");

		// On récupère la liste des liens et l'ajoute au popup
		var links_list = this.getLinksPopupLinksList(document_index, segment_node);
		new_popup.append(links_list);

		// On récupère les boutons du popup
		var buttons = this.getLinksPopupButtons(document_index, segment_node);
		for (var index in buttons)
			new_popup.append(buttons[index]);

		return new_popup;
	};

	// Crée et affiche le popup de liens
	this.openLinksPopup = function (segment_node, x, y)
	{
		// On crée un nouveau popup
		var new_popup = this.createNewLinksPopup(segment_node);

		// On le positionne
		var windows_width = $(window).width();
		new_popup.css("top", y + ($(segment_node).height() * 1.5));
		new_popup.css("max-width", (windows_width / 2) + Math.floor(Math.abs((windows_width / 2) - x)));

		if (x < (0.5 * windows_width))
			new_popup.css("left", x);
		else
			new_popup.css("right", windows_width - x);
		
		// On l'affiche
		this.main_node.append(new_popup);
		//new_popup.show(50);
		new_popup.css("display","inline");
		this.links_popup_is_displayed = true;
		this.links_popup_segment_node = segment_node;

		// On met en avant les segments liés à celui sur lequel on a cliqué
		this.startHighlightingLinkedSegments(segment_node,true);
	};

	// Ferme le popup de liens
	this.closeLinksPopup = function ()
	{
		if (! this.links_popup_is_displayed) return;

		// On ne met plus en avant les segments liés à celui cliqué
		this.stopHighlightingLinkedSegments();

		var links_popup = $("#links_popup");
		//links_popup.hide(50);
		links_popup.css("display","none");
		links_popup.remove();
		this.links_popup_is_displayed = false;
		this.links_popup_segment_node = null;
	};

	// NON FONCTIONNEL !
	// Met à jour le popup de liens
	this.updateLinksPopup = function ()
	{
		if (! this.links_popup_is_displayed) return;

		var document_index = this.getDocumentIndexFromSegmentNode(this.links_popup_segment_node);

		// On remplace la liste des liens par une liste mise à jour
		var links_list = this.getLinksPopupLinksList(document_index, this.links_popup_segment_node);

		var a = $("#links");
		$("#links_popup").prepend(links_list);	
		a.remove();	   
	};

	// --------------------------------------------------------------------------------------
	// Liens entre segments
	// --------------------------------------------------------------------------------------

	// Met en avant les segments liés au segment dont on connait le noeud
	this.startHighlightingLinkedSegments = function (segment_node,ifTriggerDrawLink)
	{
		// On récupère les indices du document parent et du segment
		var document_index = this.getDocumentIndexFromSegmentNode(segment_node);
		var segment_index  = this.getSegmentIndexFromSegmentNode(segment_node);

		console.log("Survol: "+segment_index);
		console.log(segment_node);

		if (ifTriggerDrawLink) $(document.body).trigger("segment_hover",[segment_index]);

		// On identifie les segments liés
		var links_origins 	   = this.getLinksOriginsFromSegmentNode(segment_node);
		var links_destinations = this.getLinksDestinationsFromSegmentNode(segment_node);

		// On ajoute des classes aux segments liés, suivant la configuration de l'instance
		// On affiche également l'étiquette des liens sous les segments
		if (this.display_links_origins)
			for (var index in links_origins)
			{
				var current_link = this.corpus.getMatchingLinks(document_index, {"orig": links_origins[index], "dest": segment_index})[0];

				$(".doc_" + document_index + " .origin_" + segment_index)
					.addClass("highlighted_origin")
					.filter(".seg_" + links_origins[index]).children(".segment_link_label").html(current_link.label);
			}

		if (this.display_links_destinations)
			for (var index in links_destinations)
			{
				var current_link = this.corpus.getMatchingLinks(document_index, {"orig": segment_index, "dest": links_destinations[index]})[0];
				if (current_link)
				 $(".doc_" + document_index + " .destination_" + segment_index)
					.addClass("highlighted_destination")
					.filter(".seg_" + links_destinations[index]).children(".segment_link_label").html(current_link.label);
			}
	};

	// Ne met plus en avant les segments liés à un autre segment
	this.stopHighlightingLinkedSegments = function ()
	{
		var highlighted_segments = $(".highlighted_origin, .highlighted_destination");
		highlighted_segments.removeClass("highlighted_origin highlighted_destination")
		
		// Si on est en mode cible, on n'efface pas l'étiquette des cibles
		if (this.target_mode)
			highlighted_segments.filter(".segment:not(.link_target)").children(".segment_link_label").html("&emsp;");
	};

	// --------------------------------------------------------------------------------------
	// Gestion des événements sur les segments
	// --------------------------------------------------------------------------------------

	// Ouvre un menu popup lié à un segment (suivant le mode)
	this.openPopup = function (segment_node, x, y, list_index)
	{
		if (this.links_mode)
			this.openLinksPopup(segment_node, x, y);
		else
			this.openEditPopup(segment_node, x, y, list_index);

		// On met en avant quel segment est la cible du popup
		$(segment_node).closest(".segment").addClass("popup_clicked_segment");
	};

	// Ferme le popup lié à un segment étant ouvert
	this.closePopup = function ()
	{
		this.closeEditPopup();
		this.closeLinksPopup();

		// On ne met plus en avant le segment qui était la cible du popup
		$(".popup_clicked_segment").removeClass("popup_clicked_segment");	
	};

	// Ecoute des clics sur les segments
	this.handleClicksOnSegments = function ()
	{
		this.documents.click(function (event) {
			// On se restreint aux clics sur les contenus de segments
			var segment_node = $(event.target).closest(".segment_content");
			if (segment_node.length === 0) return;

			// Si on est en mode cible, on ne peut éditer que les cibles affichées
			// Ceci n'est cependant pas vrai en mode édition
			if (this_validate_list.target_mode && segment_node.closest(".editable").length === 0)
			{
				// Mode d'édition des segments/étiquettes
				if (! this_validate_list.links_mode && segment_node.closest(".target").length === 0) return;

				// Mode cibles
				if (this_validate_list.links_mode && segment_node.closest(".link_target").length === 0) return;
			}

			// Si l'option est désactivée, la touche CTRL doit etre enfoncée pour ouvrir un popup, sinon on ne fait rien
			if (! this_validate_list.hold_ctrl_to_subdivide_segments)
				if (! event.ctrlKey) return;

			// Si on est en train d'ajouter un lien, on ignore ce handler-ci
			if (this_validate_list.link_is_beeing_added) return;

			// Si un popup est déjà ouvert, on le ferme
			//this_validate_list.closePopup();

			// On ouvre le popup si ce n'est pas sur celui qui etait affiche
			//if (($(event.target).closest("#edit_popup").length==0))
			// TODO: come back and check here
			//  {
			//  console.log("poop:"+event.target.innerHTML);
			//  this_validate_list.closePopup();
			//  if ((FREDoldsegment==null)||(FREDoldsegment!=event.target))
			//   {
 			//   this_validate_list.openPopup(event.target, event.pageX, event.pageY);
			//   FREDoldsegment=event.target;
			//   }
			//  else FREDoldsegment=null; 
			//  //$("body").off("click"); 
			//  }
			//else { console.log("popo"); this_validate_list.closePopup(); } 
			// On ferme le popup si on clic en dehors de celui-ci
			// Le timeout est une solution de "debug" (sinon popup immédiatement fermé) - à améliorer si possible !
			/*
			setTimeout(function () {
				$("body").click(function (event) {
					console.log("YUYU"); 
 
					// Si le clic est effectué sur le popup affiché, on l'ignore
					if (this_validate_list.edit_popup_is_displayed
					&&  $(event.target).closest("#edit_popup").length != 0) return;

					if (this_validate_list.links_popup_is_displayed
					&&  $(event.target).closest("#links_popup").length != 0) return;
					$("body").off("click");
					this_validate_list.closePopup();		
				});
			}, 20);*/
		});
	};

	// Ecoute des clics sur les segments
	this.handleClicksOnLabelButtons = function ()
	{
		// TODO: handle here
		this.documents.click(function (event) {
			// console.log ($(event.target).attr('class'))
			if ($(event.target).attr('class') != "validate_sentence_button") return;
			// On se restreint aux clics sur les contenus de segments
			// var segment_node = $(event.target).closest(".segment_content");
			var segment_node = $(event.target).closest(".document").find(".segment_content");
			console.log(segment_node)
			if (segment_node.length === 0) return;

			// Si on est en mode cible, on ne peut éditer que les cibles affichées
			// Ceci n'est cependant pas vrai en mode édition
			if (this_validate_list.target_mode && segment_node.closest(".editable").length === 0)
			{
				// Mode d'édition des segments/étiquettes
				if (! this_validate_list.links_mode && segment_node.closest(".target").length === 0) return;

				// Mode cibles
				if (this_validate_list.links_mode && segment_node.closest(".link_target").length === 0) return;
			}

			// Si l'option est désactivée, la touche CTRL doit etre enfoncée pour ouvrir un popup, sinon on ne fait rien
			if (! this_validate_list.hold_ctrl_to_subdivide_segments)
				if (! event.ctrlKey) return;

			// Si on est en train d'ajouter un lien, on ignore ce handler-ci
			if (this_validate_list.link_is_beeing_added) return;

			// Si un popup est déjà ouvert, on le ferme
			//this_validate_list.closePopup();

			// On ouvre le popup si ce n'est pas sur celui qui etait affiche
			//if (($(event.target).closest("#edit_popup").length==0))
			 {
			 console.log("poop:"+event.target.innerHTML);
			//  console.log(event.target.closest(".segment_content"));
			 this_validate_list.closePopup();
			 if ((FREDoldsegment==null)||(FREDoldsegment!=event.target))
			  {
				// this_validate_list.openPopup(event.target, event.pageX, event.pageY);
				console.log($(event.target)[0].id)
				this_validate_list.openPopup(segment_node, event.pageX, event.pageY, $(event.target)[0].id);
				FREDoldsegment=event.target;
			  }
			 else FREDoldsegment=null; 
			 //$("body").off("click"); 
			 }
			//else { console.log("popo"); this_validate_list.closePopup(); } 
			// On ferme le popup si on clic en dehors de celui-ci
			// Le timeout est une solution de "debug" (sinon popup immédiatement fermé) - à améliorer si possible !
			/*
			setTimeout(function () {
				$("body").click(function (event) {
					console.log("YUYU"); 
 
					// Si le clic est effectué sur le popup affiché, on l'ignore
					if (this_validate_list.edit_popup_is_displayed
					&&  $(event.target).closest("#edit_popup").length != 0) return;

					if (this_validate_list.links_popup_is_displayed
					&&  $(event.target).closest("#links_popup").length != 0) return;
					$("body").off("click");
					this_validate_list.closePopup();		
				});
			}, 20);*/
		});
	};

	// Ecoute du survol des segments
	this.handleHoverOnSegments = function (document_index)
	{
		// On ne considère ici que les segments étants liens en mode liens
		if (! this.links_mode) return;

		// On se restreint éventuellement à un document (sinon tous sont concernés)
		var targeted_segments = null;
		if (document_index)
			targeted_segments = $(".doc_" + document_index + " .linked .segment_content");
		else
			targeted_segments = $(".linked .segment_content");

		targeted_segments.mouseenter(function (event) {
			// Si un popup de liens est ouvert, il prévaut sur les effets liés au survol d'un segment
			if (this_validate_list.links_popup_is_displayed) return;

			// Si on est en mode cible et hors mode édition, on ne prend en compte que les cibles
			if (this_validate_list.target_mode)
			{
				var segment_node 		 = $(event.target).closest(".link_target");
				var document_is_editable = $(event.target).closest(".editable").length !== 0;

				if ((! document_is_editable) && segment_node.length === 0) return;
			}
			

			// On met en avant les segments liés à celui survolé
			this_validate_list.startHighlightingLinkedSegments(event.target,true);
		});

		targeted_segments.mouseleave(function (event) {
			if (this_validate_list.links_popup_is_displayed) return;

			// On supprime l'effet appliqué aux segments liés
			this_validate_list.stopHighlightingLinkedSegments();
		});
	};

	// --------------------------------------------------------------------------------------
	// Mémoire locale (localStorage)
	// --------------------------------------------------------------------------------------

	// Met en mémoire le nom de l'auteur
	// Le paramètre est optionnel (à défaut, celui du corpus est utilisé)
	this.saveAuthorInLocalStorage = function (author)
	{
		var author_to_save = author || this.corpus.getAuthor();
		localStorage.setItem("validator_author", author_to_save);
	};

	// Récupère le nom de l'auteur mémorisé, sinon undefined
	this.getSavedAuthor = function ()
	{
		var saved_author = localStorage.getItem("validator_author");
		return saved_author || undefined;
	};

	// Sauvegarde le corpus actuel, ou celui spécifié (optionnel)
	this.saveCorpusInLocalStorage = function (corpus)
	{
		var corpus_to_save 			 = corpus || this.corpus.data;
		var corpus_to_save_as_string = JSON.stringify(corpus_to_save);

		localStorage.setItem("validator_saved_corpus", corpus_to_save_as_string);
	};

	// Renvoit vrai si un corpus est sauvegardé, faux sinon
	this.corpusIsSaved = function ()
	{
		var saved_corpus_as_string = localStorage.getItem("validator_saved_corpus");
		return saved_corpus_as_string && saved_corpus_as_string.length > 0;
	};	

	// Récupère le corpus sauvegardé, sinon undefined
	this.getSavedCorpus = function ()
	{
		// S'il n'y a pas de corpus sauvegardé, on ne fait rien
		if (! this.corpusIsSaved())
		{
			console.log("Aucun corpus sauvegardé dans localStorage !");
			return undefined;
		}

		var saved_corpus_as_string = localStorage.getItem("validator_saved_corpus");
		return JSON.parse(saved_corpus_as_string);
	};

	// Met à jour la liste de valdiation avec un corpus sauvegardé
	this.restoreSavedCorpus = function (corpus)
	{
		var saved_corpus = this.getSavedCorpus();
		if (! saved_corpus) return;

		// On sauvegarde le corpus actuel, puis le remplace par celui que l'on vient de charger
		this.corpus.saveCurrentVersion();
		this.corpus.data = saved_corpus;

		// On met alors l'affichage à jour
		this.initializeMetadata();
		this.updateDisplay();
	};

	// --------------------------------------------------------------------------------------
	// Menu principal
	// --------------------------------------------------------------------------------------

	// Met à jour les boutons du menu (classe/texte selon l'état de l'instance)
	this.updateMenuButtons = function ()
	{
		// Bouton pour afficher/masquer le popup d'options
		var display_options_popup_button = $("#display_options_popup_button");
		if (this_validate_list.options_popup_is_displayed)
			$("#display_options_popup_button").html(_string("buttons", "hide_options_popup", this.language));
		else
			$("#display_options_popup_button").html(_string("buttons", "show_options_popup", this.language));

		// Bouton pour activer/désactiver le mode cible
		var target_mode_button = $("#target_mode_button");
		if (this.target_mode)
		{
			target_mode_button.removeClass("activate");
			target_mode_button.addClass("desactivate");
			target_mode_button.html(_string("buttons", "exit_target_mode", this.language));
		}
		else
		{
			target_mode_button.addClass("activate");
			target_mode_button.removeClass("desactivate");
			target_mode_button.html(_string("buttons", "enter_target_mode", this.language));
		}		

		// FIXME: did not show sentence-by-sentence mode
		// Bouton pour débuter ou quitter le mode de validation phrase par phrase
		var validate_sentence_by_sentence_button = $("#validate_sentence_by_sentence_button");
		if (this_validate_list.validate_sentence_by_sentence)
			$("#validate_sentence_by_sentence_button").html(_string("buttons", "exit_sentence_by_sentence_mode", this.language));
		else
			$("#validate_sentence_by_sentence_button").html(_string("buttons", "enter_sentence_by_sentence_mode", this.language));
	};

	// Ecoute les clics sur les boutons du menu
	this.handleClicksOnMenuButtons = function ()
	{
		// Bouton pour afficher/masquer le popup d'options
		$("#display_options_popup_button").click(function (event) {
			if (this_validate_list.options_popup_is_displayed)
			{
				//this_validate_list.options_popup.hide(50);
				this_validate_list.options_popup.css("display","none");
				this_validate_list.options_popup_is_displayed = false;
			}
			else
			{
				//this_validate_list.options_popup.show(50);
				this_validate_list.options_popup.css("display","inline");
				this_validate_list.options_popup_is_displayed = true;
			}

			this_validate_list.updateMenuButtons();
		});

		// Bouton pour activer/désactiver le mode cible
		$("#target_mode_button").click(function (event) {
			this_validate_list.target_mode = ! this_validate_list.target_mode;

			this_validate_list.updateDisplay();
		});

		// Bouton pour débuter ou quitter le mode de validation phrase par phrase
		$("#validate_sentence_by_sentence_button").click(function (event) {
			this_validate_list.validate_sentence_by_sentence = ! this_validate_list.validate_sentence_by_sentence;
			this_validate_list.links_mode=this_validate_list.validate_sentence_by_sentence; /* FOFO */ 

			this_validate_list.updateMainNodeClasses();
			this_validate_list.updateMenuButtons();
		 	this_validate_list.updateDisplay();
		});

		// Bouton pour annuler les dernières actions
		$("#undo_button").click(function (event) {
			this_validate_list.undo();
		});
	};

	// --------------------------------------------------------------------------------------
	// Popup d'options
	// --------------------------------------------------------------------------------------

	// Met à jour les boutons du popup d'options (classe/texte selon l'état de l'instance)
	this.updateOptionsPopupButtons = function ()
	{
		// Mode priorité
		var priority_mode_button = $("#priority_mode_button");
		if (this.ignore_priority_zero)
		{
			priority_mode_button.addClass("activate");
			priority_mode_button.removeClass("desactivate");
			priority_mode_button.html(_string("buttons", "consider_priority_zero_segments", this.language));
		}
		else
		{
			priority_mode_button.removeClass("activate");
			priority_mode_button.addClass("desactivate");
			priority_mode_button.html(_string("buttons", "ignore_priority_zero_segments", this.language));
		}

		// Limitation aux hypothèses
		var segments_hypothesis_mode_button = $("#segments_hypothesis_mode_button");
		if (this.only_edit_segments_hypothesis)
		{
			segments_hypothesis_mode_button.addClass("activate");
			segments_hypothesis_mode_button.removeClass("desactivate");
			segments_hypothesis_mode_button.html(_string("buttons", "edit_all_segments", this.language));
		}
		else
		{
			segments_hypothesis_mode_button.removeClass("activate");
			segments_hypothesis_mode_button.addClass("desactivate");
			segments_hypothesis_mode_button.html(_string("buttons", "only_edit_segments_hypothesis", this.language));
		}

		var labels_hypothesis_mode_button = $("#labels_hypothesis_mode_button");
		if (this.only_edit_labels_hypothesis)
		{
			labels_hypothesis_mode_button.addClass("activate");
			labels_hypothesis_mode_button.removeClass("desactivate");
			labels_hypothesis_mode_button.html(_string("buttons", "edit_all_labels", this.language));
		}
		else
		{
			labels_hypothesis_mode_button.removeClass("activate");
			labels_hypothesis_mode_button.addClass("desactivate");
			labels_hypothesis_mode_button.html(_string("buttons", "only_edit_labels_hypothesis", this.language));
		}

		var links_hypothesis_mode_button = $("#links_hypothesis_mode_button");
		if (this.only_edit_links_hypothesis)
		{
			links_hypothesis_mode_button.addClass("activate");
			links_hypothesis_mode_button.removeClass("desactivate");
			links_hypothesis_mode_button.html(_string("buttons", "edit_all_links", this.language));
		}
		else
		{
			links_hypothesis_mode_button.removeClass("activate");
			links_hypothesis_mode_button.addClass("desactivate");
			links_hypothesis_mode_button.html(_string("buttons", "only_edit_links_hypothesis", this.language));
		}

		var links_labels_hypothesis_mode_button = $("#links_labels_hypothesis_mode_button");
		if (this.only_edit_links_labels_hypothesis)
		{
			links_labels_hypothesis_mode_button.addClass("activate");
			links_labels_hypothesis_mode_button.removeClass("desactivate");
			links_labels_hypothesis_mode_button.html(_string("buttons", "edit_all_links_labels", this.language));
		}
		else
		{
			links_labels_hypothesis_mode_button.removeClass("activate");
			links_labels_hypothesis_mode_button.addClass("desactivate");
			links_labels_hypothesis_mode_button.html(_string("buttons", "only_edit_links_labels_hypothesis", this.language));
		}

		// Portée de la validation
		var validate_segments_button = $("#validate_segments_button");
		if (this.validate_segments)
		{
			validate_segments_button.addClass("desactivate");
			validate_segments_button.removeClass("activate");
			validate_segments_button.html(_string("buttons", "disallow_segments_status_validation", this.language));
		}
		else
		{
			validate_segments_button.removeClass("desactivate");
			validate_segments_button.addClass("activate");
			validate_segments_button.html(_string("buttons", "allow_segments_status_validation", this.language));
		}

		var validate_labels_button = $("#validate_labels_button");
		if (this.validate_labels)
		{
			validate_labels_button.addClass("desactivate");
			validate_labels_button.removeClass("activate");
			validate_labels_button.html(_string("buttons", "disallow_labels_status_validation", this.language));
		}
		else
		{
			validate_labels_button.removeClass("desactivate");
			validate_labels_button.addClass("activate");
			validate_labels_button.html(_string("buttons", "allow_labels_status_validation", this.language));
		}

		var validate_links_button = $("#validate_links_button");
		if (this.validate_links)
		{
			validate_links_button.addClass("desactivate");
			validate_links_button.removeClass("activate");
			validate_links_button.html(_string("buttons", "disallow_links_status_validation", this.language));
		}
		else
		{
			validate_links_button.removeClass("desactivate");
			validate_links_button.addClass("activate");
			validate_links_button.html(_string("buttons", "allow_links_status_validation", this.language));
		}

		var validate_links_labels_button = $("#validate_links_labels_button");
		if (this.validate_links_labels)
		{
			validate_links_labels_button.addClass("desactivate");
			validate_links_labels_button.removeClass("activate");
			validate_links_labels_button.html(_string("buttons", "disallow_links_labels_status_validation", this.language));
		}
		else
		{
			validate_links_labels_button.removeClass("desactivate");
			validate_links_labels_button.addClass("activate");
			validate_links_labels_button.html(_string("buttons", "allow_links_labels_status_validation", this.language));
		}


		var cancel_segments_button = $("#cancel_segments_button");
		if (this.cancel_segments)
		{
			cancel_segments_button.addClass("desactivate");
			cancel_segments_button.removeClass("activate");
			cancel_segments_button.html(_string("buttons", "disallow_segments_status_cancelation", this.language));
		}
		else
		{
			cancel_segments_button.removeClass("desactivate");
			cancel_segments_button.addClass("activate");
			cancel_segments_button.html(_string("buttons", "allow_segments_status_cancelation", this.language));
		}

		var cancel_labels_button = $("#cancel_labels_button");
		if (this.cancel_labels)
		{
			cancel_labels_button.addClass("desactivate");
			cancel_labels_button.removeClass("activate");
			cancel_labels_button.html(_string("buttons", "disallow_labels_status_cancelation", this.language));
		}
		else
		{
			cancel_labels_button.removeClass("desactivate");
			cancel_labels_button.addClass("activate");
			cancel_labels_button.html(_string("buttons", "allow_labels_status_cancelation", this.language));
		}

		var cancel_links_button = $("#cancel_links_button");
		if (this.cancel_links)
		{
			cancel_links_button.addClass("desactivate");
			cancel_links_button.removeClass("activate");
			cancel_links_button.html(_string("buttons", "disallow_links_status_cancelation", this.language));
		}
		else
		{
			cancel_links_button.removeClass("desactivate");
			cancel_links_button.addClass("activate");
			cancel_links_button.html(_string("buttons", "allow_links_status_cancelation", this.language));
		}

		var cancel_links_labels_button = $("#cancel_links_labels_button");
		if (this.cancel_links_labels)
		{
			cancel_links_labels_button.addClass("desactivate");
			cancel_links_labels_button.removeClass("activate");
			cancel_links_labels_button.html(_string("buttons", "disallow_links_labels_status_cancelation", this.language));
		}
		else
		{
			cancel_links_labels_button.removeClass("desactivate");
			cancel_links_labels_button.addClass("activate");
			cancel_links_labels_button.html(_string("buttons", "allow_links_labels_status_cancelation", this.language));
		}

		// Affichage des tokens au survol
		var highlight_tokens_button = $("#highlight_tokens_button");
		if (this.highlight_tokens)
		{
			highlight_tokens_button.addClass("desactivate");
			highlight_tokens_button.removeClass("activate");
			highlight_tokens_button.html(_string("buttons", "hide_tokens_highlighting", this.language));
		}
		else
		{
			highlight_tokens_button.removeClass("desactivate");
			highlight_tokens_button.addClass("activate");
			highlight_tokens_button.html(_string("buttons", "display_tokens_highlighting", this.language));
		}

		// Affichage des origines des liens
		var display_links_origins_button = $("#display_links_origins_button");
		if (this.display_links_origins)
		{
			display_links_origins_button.addClass("desactivate");
			display_links_origins_button.removeClass("activate");
			display_links_origins_button.html(_string("buttons", "hide_links_origins", this.language));
		}
		else
		{
			display_links_origins_button.removeClass("desactivate");
			display_links_origins_button.addClass("activate");
			display_links_origins_button.html(_string("buttons", "display_links_origins", this.language));
		}

		// Affichage des destinations des liens
		var display_links_destinations_button = $("#display_links_destinations_button");
		if (this.display_links_destinations)
		{
			display_links_destinations_button.addClass("desactivate");
			display_links_destinations_button.removeClass("activate");
			display_links_destinations_button.html(_string("buttons", "hide_links_destinations", this.language));
		}
		else
		{
			display_links_destinations_button.removeClass("desactivate");
			display_links_destinations_button.addClass("activate");
			display_links_destinations_button.html(_string("buttons", "display_links_destinations", this.language));
		}

		// Affichage des segments limité aux éléments proches des cibles
		var distance_to_targets_button = $("#distance_to_targets_button");
		if (this.hide_far_segments)
		{
			distance_to_targets_button.addClass("activate");
			distance_to_targets_button.removeClass("desactivate");
			distance_to_targets_button.html(_string("buttons", "display_far_segments", this.language));
		}
		else
		{
			distance_to_targets_button.removeClass("activate");
			distance_to_targets_button.addClass("desactivate");
			distance_to_targets_button.html(_string("buttons", "hide_far_segments", this.language));
		}

		// Remplace le contenu des cibles par l'étiquette associée
		var only_display_targets_labels_button = $("#only_display_targets_labels_button");
		if (this.only_display_targets_labels)
		{
			only_display_targets_labels_button.removeClass("desactivate");
			only_display_targets_labels_button.addClass("activate");
			only_display_targets_labels_button.html(_string("buttons", "display_targets_content", this.language));
		}
		else
		{
			only_display_targets_labels_button.addClass("desactivate");
			only_display_targets_labels_button.removeClass("activate");
			only_display_targets_labels_button.html(_string("buttons", "only_display_targets_labels", this.language));
		}

		// Sauvegarde du corpus actuel
		var save_corpus_button = $("#save_corpus_button");
		save_corpus_button.html(_string("buttons", "save_corpus", this.language));

		// Chargement d'un corpus sauvegardé
		var load_corpus_button = $("#load_corpus_button");
		load_corpus_button.html(_string("buttons", "load_corpus", this.language));
	};

	// Ecoute les clics sur le menu popup des options
	this.handleClicksOnOptionsPopup = function ()
	{
		// Bouton pour activer/désactiver la prise le mode priorité
		$("#priority_mode_button").click(function (event) {
			this_validate_list.ignore_priority_zero = ! this_validate_list.ignore_priority_zero;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour limiter ou non l'édition aux segments étant hypothèses
		$("#segments_hypothesis_mode_button").click(function (event) {
			this_validate_list.only_edit_segments_hypothesis = ! this_validate_list.only_edit_segments_hypothesis;

			this_validate_list.updateOptionsPopupButtons();
		});
		
		// Bouton pour limiter ou non l'édition aux étiquettes étant hypothèses
		$("#labels_hypothesis_mode_button").click(function (event) {
			this_validate_list.only_edit_labels_hypothesis = ! this_validate_list.only_edit_labels_hypothesis;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour limiter ou non l'édition aux liens étant hypothèses
		$("#links_hypothesis_mode_button").click(function (event) {
			this_validate_list.only_edit_links_hypothesis = ! this_validate_list.only_edit_links_hypothesis;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour limiter ou non l'édition aux étiquettes de liens étant hypothèses
		$("#links_labels_hypothesis_mode_button").click(function (event) {
			this_validate_list.only_edit_links_labels_hypothesis = ! this_validate_list.only_edit_links_labels_hypothesis;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver la validation de la segmentation
		$("#validate_segments_button").click(function (event) {
			this_validate_list.validate_segments = ! this_validate_list.validate_segments;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver l'annulation de la segmentation
		$("#cancel_segments_button").click(function (event) {
			this_validate_list.cancel_segments = ! this_validate_list.cancel_segments;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver la validation de l'étiquettage
		$("#validate_labels_button").click(function (event) {
			this_validate_list.validate_labels = ! this_validate_list.validate_labels;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver l'annulation de l'étiquettage
		$("#cancel_labels_button").click(function (event) {
			this_validate_list.cancel_labels = ! this_validate_list.cancel_labels;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver la validation des liens
		$("#validate_links_button").click(function (event) {
			this_validate_list.validate_links = ! this_validate_list.validate_links;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver l'annulation des liens
		$("#cancel_links_button").click(function (event) {
			this_validate_list.cancel_links = ! this_validate_list.cancel_links;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver la validation des étiquettes de liens
		$("#validate_links_labels_button").click(function (event) {
			this_validate_list.validate_links_labels = ! this_validate_list.validate_links_labels;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver l'annulation des étiquettes de liens
		$("#cancel_links_labels_button").click(function (event) {
			this_validate_list.cancel_links_labels = ! this_validate_list.cancel_links_labels;

			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour activer/désactiver la mise en avant des tokens au survol d'une "phrase"
		$("#highlight_tokens_button").click(function (event) {
			this_validate_list.highlight_tokens = ! this_validate_list.highlight_tokens;

			this_validate_list.updateMainNodeClasses();
			this_validate_list.updateOptionsPopupButtons();
		});

		// Bouton pour afficher/masquer les origines des liens
		$("#display_links_origins_button").click(function (event) {
			this_validate_list.display_links_origins = ! this_validate_list.display_links_origins;

			this_validate_list.updateOptionsPopupButtons();
			this_validate_list.closePopup();
		});

		// Bouton pour afficher/masquer les destinations des liens
		$("#display_links_destinations_button").click(function (event) {
			this_validate_list.display_links_destinations = ! this_validate_list.display_links_destinations;

			this_validate_list.updateOptionsPopupButtons();
			this_validate_list.closePopup();
		});

		// Bouton pour activer/désactiver l'affichage des segments (trop) distants des cibles
		$("#distance_to_targets_button").click(function (event) {
			this_validate_list.hide_far_segments = ! this_validate_list.hide_far_segments;

			this_validate_list.updateDisplay();
		});

		// Boutons pour augmenter/réduire la taille du texte
		function editFontSize (relative_variation)
		{
			// On modifie la taille de la fonte de la liste des documents, taille de police que d'autres noeuds utilisent
			$("#documents").css("font-size", "+=" + relative_variation + "rem");
		}

		$("#increase_font_size_button").click(function (event) {
			editFontSize(+ 0.5);
		});

		$("#decrease_font_size_button").click(function (event) {
			editFontSize(- 0.5);
		});

		// Bouton pour uniquement afficher l'étiquette des cibles
		$("#only_display_targets_labels_button").click(function (event) {
			this_validate_list.only_display_targets_labels = ! this_validate_list.only_display_targets_labels;

			this_validate_list.updateDisplay();
		});

		// Sauvegarde et chargement de corpus dans localStorage
		$("#save_corpus_button").click(function (event) {
			if (this_validate_list.corpusIsSaved())
			{
				var user_confirm = window.confirm(_string("dialboxes", "save_corpus_confirm", this_validate_list.language));
				if (! user_confirm) return;
			}

			this_validate_list.saveCorpusInLocalStorage();
		});

		$("#load_corpus_button").click(function (event) {
			if (! this_validate_list.corpusIsSaved())
			{
				alert(_string("dialboxes", "no_saved_corpus_alert", this_validate_list.language));
				return;
			}

			var user_confirm = window.confirm(_string("dialboxes", "load_corpus_confirm", this_validate_list.language));
			if (! user_confirm) return;

			this_validate_list.restoreSavedCorpus();
		});
	};

	// Ecoute de changements dans les formulaire du popup d'options
	this.handleOptionsPopupFormsUpdates = function ()
	{
		// On évite le rechargement de la page avec "envoi" des formulaires
		$("#author_form, #distance_to_targets_form").submit(function (event) {
			event.preventDefault();
		});

		// On met à jour l'auteur des modifications lorsque les champ sont édités
		$("#author_field").change(function (event) {
			var new_author = event.target.value;
			this_validate_list.corpus.setAuthor(new_author);

			// On mémorise le nouveau nom
			this_validate_list.saveAuthorInLocalStorage(new_author);

			console.log("L'auteur est désormais " + new_author);
		});

		// On met à jour la distance maximale pour les voisins de cibles affichables
		$("#max_target_distance_field").change(function (event) {
			var new_distance = parseInt(event.target.value);
			
			if (new_distance)
			{
				this_validate_list.close_segment_max_distance = new_distance;

				// On met à jour l'affichage seulement si on prend en compte cette distance au moment de la màj
				if (this_validate_list.hide_far_segments)
					this_validate_list.updateDisplay();
			}
		});
	};

	// Met à jour les champs de formulaire popup d'options
	this.updateOptionsPopupForms = function ()
	{
		// Auteur des corrections/de la validation
		var author_field = $("#author_field");
		if (this.highlight_tokens)
		{
			// On le remplace par celui du corpus s'il est spécifié
			var current_author = this.corpus.getAuthor();
			if (current_author && current_author.length > 0)
				author_field.val(current_author);

			// On récupère le nom mémorisé si possible, et l'utilise en premier lieu
			var saved_author = this.getSavedAuthor();
			if (saved_author)
			{
				author_field.html(saved_author);
				author_field.val(saved_author);
			}
		}

		// Affichage des segments limité aux éléments proches des cibles
		var max_target_distance_field = $("#max_target_distance_field");
		if (this.hide_far_segments)
			max_target_distance_field.val(this.segment_max_distance_to_targets);
	};

	// --------------------------------------------------------------------------------------
	// Actions globales
	// --------------------------------------------------------------------------------------

	// Ecoute les clics sur le menu popup des options
	this.handleClicksOnGlobalActionsButtons = function ()
	{
		// Bouton pour valider toute la série
		$("#validate_all_sentences_button").click(function (event) {
			this_validate_list.validateAllSentences();
		});

		// Bouton pour signlaer toute la série comme érronée
		$("#cancel_all_sentences_button").click(function (event) {
			this_validate_list.cancelAllSentences();
		});

		// Bouton pour valider les modifications et les envoyer au serveur
		$("#send_to_server_button").click(function (event) {
			var confirm = window.confirm(_string("dialboxes", "send_to_server_confirm", this_validate_list.language));
			if (! confirm) return;
			//console.log("POPO");
			// On vérifie qu'un auteur est bien spécifié, sinon on demande à l'utilisateur de le faire
			var author = this_validate_list.corpus.getAuthor();
			if ((! author) || author.length === 0)
			{	
				alert(_string("dialboxes", "no_author_alert", this_validate_list.language));
				return;
			}

			// On mémorise le temps de fin d'édition
			this_validate_list.corpus.setEndTime(Date.now());

			// On envoi au serveur
			this_validate_list.corpus.sendCorpusToServer();

			console.log("ENVOI :", this_validate_list.corpus.data);
		});

		// Download locally
		$("#annotation_title").click(function (event) {
			console.log("Download Locally!");
			var author = this_validate_list.corpus.getAuthor();
			if ((! author) || author.length === 0)
			{	
				alert(_string("dialboxes", "no_author_alert", this_validate_list.language));
				return;
			}

			// On mémorise le temps de fin d'édition
			this_validate_list.corpus.setEndTime(Date.now());

			// On envoi au serveur
			data_json = this_validate_list.corpus.getCorpusJSONData();

			console.log("data: ", data_json);

			download(JSON.stringify(data_json, null, 2), data_json['header']['filename'], "text/plain");
		});

		$('#upload_annotation_selector').change(function (event){
			console.log('here');
			console.log(this_validate_list.corpus.data);
			console.log(event.target);
			// console.log(event.target.files[0]);
			var json = null;
			var reader = new FileReader();
			reader.readAsText(event.target.files[0], "UTF-8");
			reader.onload = function (evt) {
				// console.log(evt.target.result)
				try{
					json = JSON.parse(evt.target.result);
					var author = this_validate_list.corpus.getAuthor()
					this_validate_list.corpus.data = json;
					this_validate_list.corpus.setAuthor(author);
					this_validate_list.updateDisplay();
				}
				catch(e){
					alert('there was an error: ' + e);
				}
			}
			// console.log(json);
		});

		// Bouton pour sortir sans envoyer au serveur
		$("#leave_without_saving_button").click(function (event) {
			var confirm = window.confirm(_string("dialboxes", "leave_without_saving_confirm", this_validate_list.language));
			if (! confirm) return;
			console.log("we leave");
			// this_validate_list.corpus.xhttp.open("GET", this_validate_list.corpus.filehome, true);
			this_validate_list.corpus.xhttp.open("GET", "annotation?id="+this_validate_list.getSavedAuthor()+"&path="+this_validate_list.corpus.filehome, true);
			this_validate_list.corpus.xhttp.send();
		});

	};

	// --------------------------------------------------------------------------------------
	// Gestion du multi-langue
	// --------------------------------------------------------------------------------------

	// Traduit les chaines de caractères qui ne sont pas dynamiquement écrites dans le document
	// Le paramètre, optionnel, spécifie la langue à utiliser (à défaut, la langue spécifiée dans l'instance est utilisée)
	this.translateStaticStrings = function (optionnal_language)
	{
		var language = optionnal_language || this.language;

		// Titres du popup d'options
		$("#options_title_validation").html(_string("titles", "validation_options", language));
		$("#options_title_display").html(_string("titles", "display_options", language));
		$("#options_title_metadata").html(_string("titles", "metadata_options", language));

		// Boutons du menu
		$("#undo_button").html(_string("buttons", "undo", language));

		// Bulles d'aide des boutons du menu
		$("#target_mode_button").attr("title", _string("tooltips", "target_mode", language));
		$("#validate_sentence_by_sentence_button").attr("title", _string("tooltips", "sentence_by_sentence_mode", language));
		$("#undo_button").attr("title", _string("tooltips", "undo", language));

		// Label et placeholder du champ de changement de l'auteur
		$("#author_form > label").html(_string("forms", "author_label", language));
		$("#author_field").attr("placeholder", _string("forms", "author_placeholder", language));

		// Modification de la taille de la police
		$("#increase_font_size_button").html(_string("buttons", "increase_font_size", language));
		$("#decrease_font_size_button").html(_string("buttons", "decrease_font_size", language));

		// Titres de la zone d'actions globales
		$("#global_actions_edit").html(_string("titles", "global_edit", language));
		$("#global_actions_send").html(_string("titles", "global_send", language));

		// Boutons de la zone d'actions globales
		$("#validate_all_sentences_button").html(_string("buttons", "validate_all_sentences", language));
		$("#cancel_all_sentences_button").html(_string("buttons", "cancel_all_sentences", language));
		$("#send_to_server_button").html(_string("buttons", "send_to_server", language));
		$("#leave_without_saving_button").html(_string("buttons", "leave_without_saving", language));

		// Label du champ de changement de distance aux cibles maximum
		$("#distance_to_targets_form > label").html(_string("forms", "maximum_distance_to_targets_label", language));

		// Bulles d'aide sur les boutons du popup d'options
		$("#priority_mode_button").attr("title", _string("tooltips", "priority_mode", language));

		$("#segments_hypothesis_mode_button").attr("title", _string("tooltips", "only_edit_segments_hypothesis", language));
		$("#labels_hypothesis_mode_button").attr("title", _string("tooltips", "only_edit_labels_hypothesis", language));
		$("#links_hypothesis_mode_button").attr("title", _string("tooltips", "only_edit_links_hypothesis", language));
		$("#links_labels_hypothesis_mode_button").attr("title", _string("tooltips", "only_edit_links_labels_hypothesis", language));
		
		$("#validate_segments_button").attr("title", _string("tooltips", "segments_status_validation", language));
		$("#cancel_segments_button").attr("title", _string("tooltips", "segments_status_cancelation", language));
		$("#validate_labels_button").attr("title", _string("tooltips", "labels_status_validation", language));
		$("#cancel_labels_button").attr("title", _string("tooltips", "labels_status_cancelation", language));

		$("#validate_links_button").attr("title", _string("tooltips", "links_status_validation", language));
		$("#cancel_links_button").attr("title", _string("tooltips", "links_status_cancelation", language));
		$("#validate_links_labels_button").attr("title", _string("tooltips", "links_labels_status_validation", language));
		$("#cancel_links_labels_button").attr("title", _string("tooltips", "links_labels_status_cancelation", language));

		$("#highlight_tokens_button").attr("title", _string("tooltips", "tokens_highlighting", language));
		$("#increase_font_size_button").attr("title", _string("tooltips", "increase_font_size", language));
		$("#decrease_font_size_button").attr("title", _string("tooltips", "decrease_font_size", language));
		$("#only_display_targets_labels_button").attr("title", _string("tooltips", "only_display_targets_labels", language));
		$("#distance_to_targets_button").attr("title", _string("tooltips", "far_segments", language));

		$("#save_corpus_button").attr("title", _string("tooltips", "save_corpus", language));
		$("#load_corpus_button").attr("title", _string("tooltips", "load_corpus", language));
	};

	// --------------------------------------------------------------------------------------
	// Classes du noeud parent
	// --------------------------------------------------------------------------------------

	// Suivant la configuration de l'instance, on donne certaines classes utiles au conteneur parent de la liste
	this.updateMainNodeClasses = function ()
	{
		// Type de validateur : segments/étiquettes ou liens
		if (this.links_mode)
		{
			this.main_node.removeClass("segments_labels_mode");
			this.main_node.addClass("links_mode");
		}
		else
		{
			this.main_node.addClass("segments_labels_mode");
			this.main_node.removeClass("links_mode");
		}

		// Mode cible
		if (this.target_mode)
			this.main_node.addClass("target_mode");
		else
			this.main_node.removeClass("target_mode");

		// Mode phrase par phrase
		if (this.validate_sentence_by_sentence)
			this.main_node.addClass("validate_sentence_by_sentence");
		else
			this.main_node.removeClass("validate_sentence_by_sentence");

		// Mise en avant des tokens au survol
		if (this_validate_list.highlight_tokens)
			this.main_node.addClass("highlight_tokens");
		else
			this.main_node.removeClass("highlight_tokens");
	}

	// --------------------------------------------------------------------------------------
	// Initialisation et mise à jour
	// --------------------------------------------------------------------------------------

	// Initialisation de certaines métadonnées du corpus
	this.initializeMetadata = function ()
	{
		// Si un nom d'auteur est mémorisé, on l'utilise comme auteur pour l'édition de cette série
		var saved_author = this.getSavedAuthor();
		if (saved_author && saved_author.length > 0)
			this.corpus.setAuthor(saved_author);
		else
		{
		var annotator;
		if ('validator_author' in localStorage) { annotator = JSON.parse(localStorage['validator_author']); this.corpus.setAuthor(annotator.id); }
		else this.corpus.setAuthor("NULL");
		}

		console.log("saved auth", saved_author);

		// On fixe le temps de départ de la validation/édition
		this.corpus.setStartTime(Date.now());
	};

	// Fonction principale pour mettre à jour l'affichage de la liste de validation
	// Si on spécifie un indice de document, seul celui-ci est mis à jour (gain de performances notable)
	this.updateDisplay = function (document_index)
	{
		// Si un indice de document est spécifié, seul celui-ci est mis à jour
		if (document_index >= 0)
		{
			console.log("Document " + document_index + " mis à jour");
			this.updateSentence(document_index);
		}
		// Sinon, on réaffiche toute la liste à partir du corpus
		else
		{
			console.log("Tout mis à jour");
			this.updateSentencesList();
		}

		// On cache les segments trop éloignés
		this.onlyDisplayCloseSegments();

		// On écoute les clics, survols et les sélections sur les segments
		this.handleHoverOnSegments(document_index);

		// On met à jour les boutons du popup d'option et du menu
		this.updateOptionsPopupButtons();
		this.updateMenuButtons();

		// On met à jour les classes du noeud parent
		this.updateMainNodeClasses();

		// On met à jour la phrase sélectionnée et celle éditée si elle existe
		this.updateSelectedSentence();
		this.updateEditableSentence(! this.edit_mode_is_open);

		// mode phrase a phrase => drawlink
		if (this_validate_list.validate_sentence_by_sentence) {
		 $('.selected_sentence .sentence_content').addClass('drawlink');
		 this.addDrawLink(this.selected_sentence);
		 }
		else { $('.selected_sentence .sentence_content').removeClass('drawlink'); }
	};

        this.addDrawLink = function (selected_sentence) {
		 console.log("YO: selected_sentence="+selected_sentence);
		 $(".doc_"+selected_sentence).css('height',800).addClass('drawlink').append($('<div>').attr('id','phrase_drawlink'));
		 launch_drawlink(corpus,selected_sentence);
		 $(".selected_sentence").on("refresh_drawlink", function(event){ console.log("REFRESH"); this_validate_list.updateDisplay(selected_sentence); } );
		 $(document.body).off("drawlink_hover");
		 $(document.body).on("drawlink_hover",function (event,index) {
		 	var segment_node = $(".selected_sentence .sentence_content .tok_"+index)[0];
			this_validate_list.stopHighlightingLinkedSegments();
			this_validate_list.startHighlightingLinkedSegments(segment_node,false);
		  });
	}

	// Fonction d'initialisation de la liste de validation
	this.initialize = function ()
	{
		// On met à jour l'affichage de la liste
		this.updateDisplay();

		// On écoute les clics sur les boutons du menu, du popup d'options, et de la zone d'actions globales
		this.handleClicksOnMenuButtons();
		this.handleClicksOnOptionsPopup();
		this.handleClicksOnGlobalActionsButtons();

		// On écoute les changements dans le formulaire du popup d'options, et le met à jour
		this.handleOptionsPopupFormsUpdates();
		this.updateOptionsPopupForms();

		// On écoute les clics et sélections sur les segments
		// this.handleClicksOnSegments();
		this.handleClicksOnLabelButtons();
		// this.handleSegmentsTextSelection(); // TODO: check here

		// TODO: check unusefulness
		// On écoute les clics et doubles-clics sur les phrases
		// this.handleClicksOnSentences();
		// this.handleDoubleClicksOnSentences();

		// On surveille l'appui de touches pour les raccourcis clavier
		this.handleSentencesRelatedKeyboardShortcuts();
		this.handleHistoryKeyboardShortcuts();

		// On traduit les chaines de caractères statiques
		this.translateStaticStrings();

		// On initialise les métadonnées relatives à l'édition de cette série
		this.initializeMetadata();
	};

	// NOTE IMPORTANTE :
	// La liste doit etre initialisée pour etre utilisée UNIQUEMENT UNE FOIS QUE LE CORPUS EST TOTALEMENT CHARGE !
	// On écrit ci-dessous une initialisation automatique, mais différée de l'instanciation.

	(function autoInit ()
	{
		if (this_validate_list.corpus && this_validate_list.corpus.is_loaded)
			this_validate_list.initialize();
		else
			setTimeout(function () {
				autoInit();
			}, 150);
	})();
}
  
