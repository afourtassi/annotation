// --------------------------------------------------------------------------------------
// GESTION DU MULTI-LANGUES
// --------------------------------------------------------------------------------------
// Ce fichier définit une variable globale contenant toutes les chaines de caractères
// relatives aux interfaces utilisées, et ce dans plusieurs langues si nécessaire.
//
// Une meme information peut ainsi etre donnée en plusieurs langues.
// --------------------------------------------------------------------------------------

STRINGS = {};

function _string (category, name, language)
{
	// Si l'information demandé n'est pas disponible dans la langue spécifiée, on donne la version anglaise à défaut
	return STRINGS[category][name][language] ?
		   STRINGS[category][name][language] :
		   STRINGS[category][name]["en"] 	 ;
}

// --------------------------------------------------------------------------------------
// BUTTONS
// --------------------------------------------------------------------------------------

STRINGS.buttons = {
	
	// ----------------------------------------------------------------------------------
	// MAIN MENU
	// ----------------------------------------------------------------------------------

	// Display/hide options popup
	show_options_popup: {
		"fr": "Afficher les options",
		"en": "Show options"
	},

	hide_options_popup: {
		"fr": "Masquer les options",
		"en": "Hide options"
	},

	// Enter/exit sentence-by-sentence mode
	enter_sentence_by_sentence_mode: {
		"fr": "Mode phrase par phrase",
		"en": "Sentence-by-sentence mode"
	},

	exit_sentence_by_sentence_mode: {
		"fr": "Mode classique",
		"en": "Classic mode"
	},

	// Undo last action
	undo: {
		"fr": "↺ Annuler",
		"en": "↺ Undo"
	},

	// ----------------------------------------------------------------------------------
	// OPTIONS POPUP
	// ----------------------------------------------------------------------------------

	// Enter/exit target mode
	enter_target_mode: {
		"fr": "Activer le mode cible",
		"en": "Enter target mode"
	},

	exit_target_mode: {
		"fr": "Désactiver le mode cible",
		"en": "Exit target mode"
	},

	// Consider/ignore priority zero segments
	consider_priority_zero_segments: {
		"fr": "Considérer les segments de priorité nulle",
		"en": "Consider priority-zero segments"
	},

	ignore_priority_zero_segments: {
		"fr": "Ignorer les segments de priorité nulle",
		"en": "Ignore priority-zero segments"
	},

	// Only edit hypothesis, or not (segments/labels/links)
	only_edit_segments_hypothesis: {
		"fr": "Segmentation : éditer uniquement les hypothèses",
		"en": "Segmentation : only edit hypothesis"
	},

	edit_all_segments: {
		"fr": "Segmentation : éditer tous les statuts",
		"en": "Segmentation : edit all status"
	},

	only_edit_labels_hypothesis: {
		"fr": "Etiquettes : éditer uniquement les hypothèses",
		"en": "Labels : only edit hypothesis"
	},

	edit_all_labels: {
		"fr": "Etiquettes : éditer tous les statuts",
		"en": "Labels : edit all status"
	},

	only_edit_links_hypothesis: {
		"fr": "Liens : éditer uniquement les hypothèses",
		"en": "Links : only edit hypothesis"
	},

	edit_all_links: {
		"fr": "Liens : éditer tous les statuts",
		"en": "Links : edit all status"
	},

	only_edit_links_labels_hypothesis: {
		"fr": "Etiquettes de liens : éditer uniquement les hypothèses",
		"en": "Links labels : only edit hypothesis"
	},

	edit_all_links_labels: {
		"fr": "Etiquettes de liens : éditer tous les statuts",
		"en": "Links labels : edit all status"
	},

	// Allow/disallow segments status edit
	allow_segments_status_validation: {
		"fr": "Activer la validation de la segmentation",
		"en": "Allow segmentation validation"
	},

	disallow_segments_status_validation: {
		"fr": "Désactiver la validation de la segmentation",
		"en": "Disallow segmentation validation"
	},

	allow_segments_status_cancelation: {
		"fr": "Activer l'annulation de la segmentation",
		"en": "Allow segmentation cancelation"
	},

	disallow_segments_status_cancelation: {
		"fr": "Désactiver l'annulation de la segmentation",
		"en": "Disallow segmentation cancelation"
	},

	// Allow/disallow labels status edit
	allow_labels_status_validation: {
		"fr": "Activer la validation de l'étiquettage",
		"en": "Allow label validation"
	},

	disallow_labels_status_validation: {
		"fr": "Désactiver la validation de l'étiquettage",
		"en": "Disallow label validation"
	},

	allow_labels_status_cancelation: {
		"fr": "Activer l'annulation de l'étiquettage",
		"en": "Allow label cancelation"
	},

	disallow_labels_status_cancelation: {
		"fr": "Désactiver l'annulation de l'étiquettage",
		"en": "Disallow label cancelation"
	},

	// Allow/disallow links status edit
	allow_links_status_validation: {
		"fr": "Activer la validation des liens",
		"en": "Allow links validation"
	},

	disallow_links_status_validation: {
		"fr": "Désactiver la validation des liens",
		"en": "Disallow links validation"
	},

	allow_links_status_cancelation: {
		"fr": "Activer l'annulation des liens",
		"en": "Allow links cancelation"
	},

	disallow_links_status_cancelation: {
		"fr": "Désactiver l'annulation des liens",
		"en": "Disallow links cancelation"
	},

	// Allow/disallow links labels status edit
	allow_links_labels_status_validation: {
		"fr": "Activer la validation des étiquettes de liens",
		"en": "Allow links labels validation"
	},

	disallow_links_labels_status_validation: {
		"fr": "Désactiver la validation des étiquettes de liens",
		"en": "Disallow links labels validation"
	},

	allow_links_labels_status_cancelation: {
		"fr": "Activer l'annulation des étiquettes de liens",
		"en": "Allow links labels cancelation"
	},

	disallow_links_labels_status_cancelation: {
		"fr": "Désactiver l'annulation des étiquettes de liens",
		"en": "Disallow links labels cancelation"
	},

	// Display/hide tokens highlighting
	display_tokens_highlighting: {
		"fr": "Afficher les tokens (au survol)",
		"en": "Display tokens (on mouse over)"
	},

	hide_tokens_highlighting: {
		"fr": "Masquer les tokens (au survol)",
		"en": "Hide tokens (on mouse over)"
	},

	// Font size
	increase_font_size: {
		"fr": "A+",
		"en": "A+"
	},

	decrease_font_size: {
		"fr": "A−",
		"en": "A−"
	},

	// Display/hide links origins
	display_links_origins: {
		"fr": "Afficher les origines des liens",
		"en": "Display links' origins"
	},

	hide_links_origins: {
		"fr": "Masquer les origines des liens",
		"en": "Hide links' origins"
	},

	// Display/hide links destinations
	display_links_destinations: {
		"fr": "Afficher les destinations des liens",
		"en": "Display links' destinations"
	},

	hide_links_destinations: {
		"fr": "Masquer les destinations des liens",
		"en": "Hide links' destinations"
	},

	// Display/hide segments distant to targets
	display_far_segments: {
		"fr": "Afficher les segments distants des cibles",
		"en": "Display far from targets segments"
	},

	hide_far_segments: {
		"fr": "Masquer les segments distants des cibles",
		"en": "Hide far from targets segments"
	},

	// Only display targets labels
	only_display_targets_labels: {
		"fr": "Masquer le contenu des cibles (mode cible)",
		"en": "Hide targets content (target mode)"
	},

	display_targets_content: {
		"fr": "Afficher le contenu des cibles (mode cible)",
		"en": "Display targets content (target mode)"
	},

	// Save/load corpus
	save_corpus: {
		"fr": "Sauvegarder le corpus",
		"en": "Save corpus"
	},

	load_corpus: {
		"fr": "Charger un corpus",
		"en": "Load corpus"
	},

	// ----------------------------------------------------------------------------------
	// EDIT POPUP
	// ----------------------------------------------------------------------------------

	merge_left_segment: {
		"fr": "⇤",
		"en": "⇤"
	},

	merge_right_segment: {
		"fr": "⇥",
		"en": "⇥"
	},

	validate_segmentation: {
		"fr": "✓",
		"en": "✓"
	},

	cancel_segmentation: {
		"fr": "✗",
		"en": "✗"
	},

	// ----------------------------------------------------------------------------------
	// LINKS POPUP
	// ----------------------------------------------------------------------------------

	validate_link_status: {
		"fr": "✓",
		"en": "✓"
	},

	cancel_link_status: {
		"fr": "✗",
		"en": "✗"
	},

	remove_link: {
		"fr": "Supprimer",
		"en": "Delete"
	},

	new_link: {
		"fr": "✚ Nouveau lien",
		"en": "✚ New link"
	},

	// ----------------------------------------------------------------------------------
	// SENTENCES
	// ----------------------------------------------------------------------------------

	validate_sentence: {
		"fr": "✓ Valider",
		"en": "✓ Validate"
	},

	cancel_sentence: {
		"fr": "✗ Erreur",
		"en": "✗ Error"
	},

	// ----------------------------------------------------------------------------------
	// GLOBAL ACTIONS
	// ----------------------------------------------------------------------------------

	validate_all_sentences: {
		"fr": "✓ Valider",
		"en": "✓ Validate"
	},

	cancel_all_sentences: {
		"fr": "✗ Erreur",
		"en": "✗ Error"
	},

	send_to_server: {
		"fr": "Confirmer les modifications",
		"en": "Confirm modifications"
	},

    leave_without_saving: {
        "fr": "Sortir sans sauvegarder les annotations",
        "en": "Exit without saving annotations"
    }
};

// --------------------------------------------------------------------------------------
// TITLES AND SUBTITLES
// --------------------------------------------------------------------------------------

STRINGS.titles = {
	
	// ----------------------------------------------------------------------------------
	// OPTIONS POPUP
	// ----------------------------------------------------------------------------------
	annotation_title: {
		"fr": "Vous annotez: ",
		"en": "You are annotating: "
	},

	validation_options: {
		"fr": "Validation",
		"en": "Validation"
	},

	display_options: {
		"fr": "Affichage",
		"en": "Display"
	},

	metadata_options: {
		"fr": "Métadonnées & sauvegardes",
		"en": "Metadata & saving"
	},

	// ----------------------------------------------------------------------------------
	// GLOBAL ACTIONS ZONE
	// ----------------------------------------------------------------------------------

	global_edit: {
		"fr": "Corrections globales",
		"en": "Global editing"
	},

	global_send: {
		"fr": "Envoyer au serveur",
		"en": "Send to server"
	},

	// ----------------------------------------------------------------------------------
	// LINKS POPUP
	// ----------------------------------------------------------------------------------

	links_from_other_segments: {
		"fr": "Liens issus d'autres segments :",
		"en": "Links from other segments"
	},

	links_to_other_segments: {
		"fr": "Liens allant vers d'autres segments :",
		"en": "Links to other segments"
	},
};

// --------------------------------------------------------------------------------------
// FORMS
// --------------------------------------------------------------------------------------

STRINGS.forms = {
	
	// ----------------------------------------------------------------------------------
	// OPTIONS POPUP FORM
	// ----------------------------------------------------------------------------------

	author_label: {
		"fr": "Auteur des modifications : ",
		"en": "Modifications' author: "
	},

	author_placeholder: {
		"fr": "Nom de l'auteur : ",
		"en": "Author's name: "
	},

	maximum_distance_to_targets_label: {
		"fr": "Distance maximum : ",
		"en": "Maximum distance: "
	}
};

// --------------------------------------------------------------------------------------
// TOOLTIPS
// --------------------------------------------------------------------------------------

STRINGS.tooltips = {

	// ----------------------------------------------------------------------------------
	// MAIN MENU
	// ----------------------------------------------------------------------------------
	
	// Target mode
	target_mode: {
		"fr": "Le mode cible permet de se concentrer sur certains segments marqués comme \"cibles\". L'affichage est adapté (une cible par bloc, contextes délimités) et la validation ne porte que sur les cibles.",
		"en": "Target mode allow you to concentrate on some particular segments, marked as \"targets\". Display is adapted (one target per block, delimited contexts), and validation only aims targets."
	},

	// Sentence-by-sentence mode
	sentence_by_sentence_mode: {
		"fr": "Le mode phrase par phrase permet d'afficher uniquement la phrase courante (celle étant sélectionnée).",
		"en": "Sentence-by-sentence mode only displays current sentence (the selected one)."
	},

	// Undo
	undo: {
		"fr": "Annuler la dernière édition du corpus.",
		"en": "Cancel last corpus' edit."
	},

	// ----------------------------------------------------------------------------------
	// OPTIONS POPUP
	// ----------------------------------------------------------------------------------
	
	// Priority zero segments
	priority_mode: {
		"fr": "Si l'option est activée, tous les segments peuvent etre validés. Sinon, ceux ayant une priorité nulle (0) sont ignorés.",
		"en": "If activated, all segments may be validated. Else, those with a null priority (0) are ignored."
	},

	// Only edit hypothesis (segments/labels/links)
	only_edit_segments_hypothesis: {
		"fr": "Si l'option est activée, seuls les segments dont la segmentation est hypothétique sont ciblés.",
		"en": "If activated, only segments whose segmentation status is hypothetic are aimed."
	},

	only_edit_labels_hypothesis: {
		"fr": "Si l'option est activée, seuls les segments dont l'étiquettage est hypothétique sont ciblés.",
		"en": "If activated, only segments whose label status is hypothetic are aimed."
	},

	only_edit_links_hypothesis: {
		"fr": "Si l'option est activée, seuls les liens dont le statut est hypothétique sont ciblés.",
		"en": "If activated, only links whose status is hypothetic are aimed."
	},

	only_edit_links_labels_hypothesis: {
		"fr": "Si l'option est activée, seuls les liens dont le statut des étiquettes est hypothétique sont ciblés.",
		"en": "If activated, only links whose label status is hypothetic are aimed."
	},

	// Segments status edit
	segments_status_validation: {
		"fr": "Active ou désactive la validation de la segmentation.",
		"en": "Allow or disallow segmentation validation."
	},

	segments_status_cancelation: {
		"fr": "Active ou désactive le marquage de la segmentation comme éroné.",
		"en": "Allow or disallow to report segmenation as an error."
	},

	// Labels status edit
	labels_status_validation: {
		"fr": "Active ou désactive la validation de l'étiquettage.",
		"en": "Allow or disallow label validation."
	},

	labels_status_cancelation: {
		"fr": "Active ou désactive le marquage de l'étiquettage comme éroné.",
		"en": "Allow or disallow to report label as an error."
	},

	// Links status edit
	links_status_validation: {
		"fr": "Active ou désactive la validation des liens.",
		"en": "Allow or disallow links validation."
	},

	links_status_cancelation: {
		"fr": "Active ou désactive le marquage des liens comme éronés.",
		"en": "Allow or disallow to report links as errors."
	},

	// Links labels status edit
	links_labels_status_validation: {
		"fr": "Active ou désactive la validation des étiquettes de liens.",
		"en": "Allow or disallow links labels validation."
	},

	links_labels_status_cancelation: {
		"fr": "Active ou désactive le marquage des étiquettes de liens comme éronés.",
		"en": "Allow or disallow to report links labels as errors."
	},

	// Tokens highlighting
	tokens_highlighting: {
		"fr": "Affiche ou masque la délimitation entre les tokens lors du survol d'une \"phrase\".",
		"en": "Display or hide boundaries between tokens when the mouse is over a \"sentence\""
	},

	// Font size
	increase_font_size: {
		"fr": "Augmenter la taille de la police.",
		"en": "Increase font size."
	},

	decrease_font_size: {
		"fr": "Réduire la taille de la police.",
		"en": "Decrease font size."
	},

	// Only display targets labels
	only_display_targets_labels: {
		"fr": "En mode cible, remplace le contenu des cibles par leur étiquette.",
		"en": "In target mode, targets contents are replaced by their labels."
	},

	// Display/hide links origins & destinations
	display_links_origins: {
		"fr": "Afficher ou masquer les origines des liens.",
		"en": "Display or hide links origins."
	},

	display_links_destinations: {
		"fr": "Afficher ou masquer les destinations des liens.",
		"en": "Display or hide links destinations."
	},

	// Segments distant to targets
	far_segments: {
		"fr": "Affiche ou masque les segments trop éloignés d'une cible. La distance maximum pouvant etre affichée est réglable ci-dessous.",
		"en": "Display or hide segments which are too far from targets. Maximum displayed distance may be modified under this button."
	},

	// Save/load corpus from localStorage
	save_corpus: {
		"fr": "Sauvegarde le corpus actuel dans localStorage. Si un corpus y était déjà sauvegardé, il est écrasé.",
		"en": "Save current corpus in localStorage. If there already was a corpus saved, old one is erased."
	},

	load_corpus: {
		"fr": "Si possible, charge un corpus auparavant enregistré dans localStorage.",
		"en": "Load a corpus from localStorage, if available."
	},


	// ----------------------------------------------------------------------------------
	// EDIT POPUP
	// ----------------------------------------------------------------------------------

	merge_left_segment: {
		"fr": "Fusionner avec le segment de gauche.",
		"en": "Merge with the segment on the left."
	},

	merge_right_segment: {
		"fr": "Fusionner avec le segment de droite.",
		"en": "Merge with the segment on the right."
	},

	validate_segmentation: {
		"fr": "Valider la segmentation.",
		"en": "Validate segmentation."
	},

	cancel_segmentation: {
		"fr": "Marquer la segmentation comme fausse.",
		"en": "Set segmentation as false."
	},

	// ----------------------------------------------------------------------------------
	// LINKS POPUP
	// ----------------------------------------------------------------------------------

	validate_link_status: {
		"fr": "Valider le lien.",
		"en": "Validate link."
	},

	cancel_link_status: {
		"fr": "Marquer le lien comme éronné.",
		"en": "Set link as false."
	},

	delete_link: {
		"fr": "Supprimer le lien.",
		"en": "Delete link."
	},

	new_link: {
		"fr": "Crée un nouveau lien issu du segment cliqué, et possédant l'étiquette sélectionnée ci-contre.\n\nUne fois le bouton cliqué, le popup se ferme : il faut alors cliquer sur un segment pour créer un lien vers celui-ci. L'ajout de lien est annulé si le clic n'est pas effectué sur un segment valide.",
		"en": "Create a new link from clicked segment, owning the label specified by the one selected in the list next to this button.\n\nOnce button is clicked, the popup will close : click on the segment you want to create a link to. If you click elsewhere, new link operation is canceled."
	}, 
};

// --------------------------------------------------------------------------------------
// DIALOG BOXES
// --------------------------------------------------------------------------------------

STRINGS.dialboxes = {
	
	// ----------------------------------------------------------------------------------
	// GLOBAL ACTIONS
	// ----------------------------------------------------------------------------------

    leave_without_saving_confirm: {
		"fr": "Voulez-vous vraiment sortir sans sauvegarder vos annotations ?",
		"en": "Do you really want to exit without saving your annotations ?"
    },

	send_to_server_confirm: {
		"fr": "Voulez-vous vraiment valider cette série et l'envoyer au serveur ?",
		"en": "Do you really want to validate this serie and to send it to the server?"
	},

	no_author_alert: {
		"fr": "Veuillez spécifier un auteur avant d'envoyer cette série au serveur.",
		"en": "Please specify an author before sending this serie to the server."
	},

	// ----------------------------------------------------------------------------------
	// SAVE/LOAD CORPUS
	// ----------------------------------------------------------------------------------

	save_corpus_confirm: {
		"fr": "Voulez-vous réellement écraser le corpus déjà sauvegardé ?",
		"en": "Do you really want to save current corpus onto the previously saved one?"
	},

	load_corpus_confirm: {
		"fr": "Voulez-vous réellement charger le corpus sauvegardé? Toutes les modifications apportées au corpus actuel seront perdues.",
		"en": "Do you really want to load the saved corpus? All edits on current corpus will be lost."
	},

	no_saved_corpus_alert: {
		"fr": "Aucun corpus n'est sauvegardé : chargement impossible.",
		"en": "No saved corpus: loading one is impossible."
	}
};  
