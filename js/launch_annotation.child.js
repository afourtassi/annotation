/*  Creation de l'interface d'annotation de Camille  */

function display_interface_annotation()
{
var n_section,n_mainmenu,n_option,n_div,n_form,n_div2;
$('body').html("");
n_section=$('<section>').attr('id','validator');
$('body').append(n_section);
 n_mainmenu=$('<div>').attr('id','main_menu');
 n_section.append(n_mainmenu);
  n_mainmenu.append($('<button>').attr('id','display_options_popup_button').attr('type','button').text('Afficher les options'));
  // n_mainmenu.append($('<text>').attr('id', 'annotation_title').text('Title'));
  n_mainmenu.append($('<button>').attr('id', 'annotation_title').text('Title'));
  n_mainmenu.append($('<button>').attr('id', 'upload_anotation_button').text('Load From File').attr('onclick', "document.getElementById('upload_annotation_selector').click()"));
  n_mainmenu.append($('<input>').attr('type', 'file').attr('id', 'upload_annotation_selector').attr('style', "display:none").text('Upload'));
  
  // <button style="display:block;width:120px; height:30px;" onclick="document.getElementById('getFile').click()">Your text here</button>
  // <input type='file' id="getFile" style="display:none"></input>

  // n_mainmenu.append($('<button>').attr('id','target_mode_button').attr('class','desactivate').attr('type','button').text('Prise en compte des cibles'));
  // n_mainmenu.append($('<button>').attr('id','validate_sentence_by_sentence_button').attr('type','button').text('Validation phrase par phrase'));
  n_mainmenu.append($('<button>').attr('id','undo_button').attr('type','button').text('Annuler'));
 n_option=$('<div>').attr('id','options_popup').attr('class','popup');
 n_section.append(n_option);
  n_div=$('<div>');
  n_option.append(n_div);
   n_div.append($('<h3>').attr('id','options_title_validation').text('Validation')); 
   n_div.append($('<button>').attr('id','priority_mode_button').attr('class','desactivate').attr('type','button').text('Ignorer la priorité zéro'));
   n_div.append($('<hr>'));
   n_div.append($('<button>').attr('id','segments_hypothesis_mode_button').attr('class','desactivate').attr('type','button').text('Segmentation : uniquement éditer les hypothèses'));
   n_div.append($('<button>').attr('id','labels_hypothesis_mode_button').attr('class','desactivate').attr('type','button').text('Etiquettes : uniquement éditer les hypothèses'));
   n_div.append($('<button>').attr('id','links_hypothesis_mode_button').attr('class','desactivate').attr('type','button').text('Liens : uniquement éditer les hypothèses'));
   n_div.append($('<button>').attr('id','links_labels_hypothesis_mode_button').attr('class','desactivate').attr('type','button').text('Etiquettes de liens : uniquement éditer les hypothèses'));
   n_div.append($('<hr>'));
   n_div.append($('<button>').attr('id','validate_segments_button').attr('class','desactivate').attr('type','button').text('Désactiver la validation de la segmentation'));
   n_div.append($('<button>').attr('id','cancel_segments_button').attr('class','desactivate').attr('type','button').text("Désactiver l'annulation de la segmentation"));
   n_div.append($('<button>').attr('id','validate_labels_button').attr('class','desactivate').attr('type','button').text("Désactiver la validation de l'étiquetage"));
   n_div.append($('<button>').attr('id','cancel_labels_button').attr('class','desactivate').attr('type','button').text("Désactiver l'annulation de l'étiquetage"));
   n_div.append($('<button>').attr('id','validate_links_button').attr('class','desactivate').attr('type','button').text("Désactiver la validation des liens"));
   n_div.append($('<button>').attr('id','cancel_links_button').attr('class','desactivate').attr('type','button').text("Désactiver l'annulation des liens"));
   n_div.append($('<button>').attr('id','validate_links_labels_button').attr('class','desactivate').attr('type','button').text("Désactiver la validation des étiquettes de liens"));
   n_div.append($('<button>').attr('id','cancel_links_labels_button').attr('class','desactivate').attr('type','button').text("Désactiver l'annulation des étiquettes de liens"));
  n_div=$('<div>');
  n_option.append(n_div);
   n_div.append($('<hr>'));
   n_div.append($('<h3>').attr('id','options_title_display').text('Affichage'));
   n_div.append($('<button>').attr('id','decrease_font_size_button').attr('type','button').text("A--"));
   n_div.append($('<button>').attr('id','highlight_tokens_button').attr('class','activate').attr('type','button').text("Afficher les tokens au survol"));
   n_div.append($('<button>').attr('id','increase_font_size_button').attr('type','button').text("A++"));
   n_div.append($('<button>').attr('id','only_display_targets_labels_button').attr('class','activate').attr('type','button').text("Afficher seulement les étiquettes des cibles"));
   n_div.append($('<button>').attr('id','display_links_origins_button').attr('class','desactivate').attr('type','button').text("Masquer les origines des liens"));
   n_div.append($('<button>').attr('id','display_links_destinations_button').attr('class','desactivate').attr('type','button').text("Masquer les destinations des liens"));
   n_form=$('<form>').attr('id','distance_to_targets_form');;
   n_div.append(n_form);
    n_form.append($('<button>').attr('id','distance_to_targets_button').attr('type','button').text("Afficher seulement les segments proches"));
    n_form.append($('<label>').attr('for','max_target_distance_field').text("Distance maximum : "));
    n_form.append($('<input>').attr('id','max_target_distance_field').attr('type','number').attr('min','1').attr('placeholder','Distance'));
   n_div.append($('<hr>'));
   n_div.append($('<h3>').attr('id','options_title_metadata').text('Métadonnées & sauvegarde'));
   n_form=$('<form>').attr('id','author_form');;
   n_div.append(n_form);
    n_form.append($('<label>').attr('for','author_field').text("Auteur des modifications :"));
    n_form.append($('<input>').attr('id','author_field').attr('type','text').attr('placeholder',"Nom de l'auteur"));
   n_div.append($('<button>').attr('id','save_corpus_button').attr('type','button').text("Sauvegarder le corpus"));
   n_div.append($('<button>').attr('id','load_corpus_button').attr('type','button').text("Charger un corpus"));
 n_div=$('<div>').attr('id','documents');;
 n_section.append(n_div);
 n_div=$('<div>').attr('id','global_actions');;
 n_section.append(n_div);
  n_div2=$('<div>');
  n_div.append(n_div2);
   n_div2.append($('<h3>').attr('id','global_actions_exit').text("Retour au choix de corpus"));
   n_div2.append($('<button>').attr('id','leave_without_saving_button').attr('type','button').text("Sortir sans sauvegarder"));

  if (0) /* correction globales for the moment */
   {
   n_div2=$('<div>');
   n_div.append(n_div2);
    n_div2.append($('<h3>').attr('id','global_actions_edit').text("Corrections globales"));
    n_div2.append($('<button>').attr('id','validate_all_sentences_button').attr('type','button').text("Tout valider"));
    n_div2.append($('<button>').attr('id','cancel_all_sentences_button').attr('type','button').text("Tout annuler"));
   }
  n_div2=$('<div>');
  n_div.append(n_div2);
   n_div2.append($('<h3>').attr('id','global_actions_send').text("Envoi au serveur"));
   n_div2.append($('<button>').attr('id','send_to_server_button').attr('type','button').text("Valider cette série"));
}
 
