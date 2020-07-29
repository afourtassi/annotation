var DrawlinkScrolleft=0;

function launch_drawlink(corpus,selected_sentence_index) {
console.log("launch_drawlink");
var drawlinkTPosX=[];
const HautArc = -60;
const DeltaArc = -20;
const DeltaX=40;
var MySvg,TArc=[], TRoot=[],TextBox={word: null, pos: null, link: null},IfCtrl=false;
var OrigTextX=10,OrigTextY;
var prevselected={deb:null,fin:null},prevoverflow={orig:null,dest:null},previndex={deb:-1,fin:-1,save:-1},coul={deb:"red",fin:"green"};
var select_sentence=corpus.getDocument(selected_sentence_index);
var allowed_labels=corpus.getLinksLabelsList();
var author=corpus.getAuthor();

OrigTextY=($('#phrase_drawlink').get()[0].clientHeight)-90;


	// --------------------------------------------------------------------------------------
	// Menu popup d'édition LINK (drawlink)
	// --------------------------------------------------------------------------------------

	// Renvoit la liste des étiquettes du popup d'édition
	drawlink_getEditPopupLabelsList = function (link) {
		// On crée la liste des étiquettes
		var labels_list = $("<ul class=\"labels_list\">");
		for (var label_index in allowed_labels) {
			var current_label = allowed_labels[label_index];
			var current_label_list_element = $("<li>").attr("id","link"+label_index).text(current_label);
			labels_list.append(current_label_list_element);
			if (current_label == link.label) current_label_list_element.addClass("selected_label");
			current_label_list_element.click(function (event) {
					corpus.saveCurrentVersion();
					link.label=allowed_labels[parseInt(this.id.slice(4))];
					link.timestamp=Date.now();
					link.status_lab="G";
					link.author=author;
					// On ferme le popup
					drawlink_closeEditPopup();
					drawPhrase(MySvg);
        				$(".selected_sentence").trigger("refresh_drawlink");
					});
		}
		return labels_list;
	};

	// Crée et renvoit le popup d'édition
	drawlink_createNewEditPopup = function (link) {
		// Si un popup d'id edit_popup existe, on le supprime
		$("#edit_popup").remove();
		// On crée un nouveau popup
		var new_popup = $("<div class=\"popup\" id=\"edit_popup\">");
		// On récupère la liste des étiquettes et l'ajoute au popup
		var labels_list = drawlink_getEditPopupLabelsList(link);
		new_popup.append(labels_list);
		return new_popup;
	};

	// Crée et affiche le popup d'édition
	drawlink_openEditPopup = function (x, y, link) {
        console.log("openEditPopup");
		// On crée un nouveau popup
		var new_popup = drawlink_createNewEditPopup(link);
		// On le positionne
		var windows_width = $(window).width();
		new_popup.css("top", y);
		new_popup.css("left", x);
		// On l'affiche
		$("#validator").append(new_popup);
		new_popup.css("display","inline");
		drawlink_edit_popup_is_displayed = true;
	};

	// Ferme le popup d'édition
	drawlink_closeEditPopup = function () {
		if (! drawlink_edit_popup_is_displayed) return;
       		console.log("closeEditPopup");
		var edit_popup = $("#edit_popup");
		//edit_popup.hide(50);
		edit_popup.css("display","none");
		//edit_popup.remove();
		drawlink_edit_popup_is_displayed = false;
	};

	// --------------------------------------------------------------------------------------

/*
function find_token_id(id)
{
for (var i=0;i<select_sentence.tokens.length;i++)
 if (select_sentence.tokens[i].id==id) return i;
console.log("STRANGE : id inconnu !! => "+id+" in "+select_sentence.tokens);
return 0;
}
*/

function find_link_id(orig)
{
for (var i=0;i<select_sentence.links.length;i++) if (select_sentence.links[i].orig==orig) return i;
return -1;
}

function foverfloww(index,ifTriggerSegment) {
 	if (previndex["deb"]!=-1) /* on est en mode "ARC" */
	 {
	 if (previndex["deb"]==index) return;
	 /* si on a deja dessine un arc en rouge, on le remet comme avant */
	 if (previndex["fin"]!=-1)
	  {
	  var ilink=find_link_id(previndex["fin"]);
	  select_sentence.links[ilink].dest=previndex["save"];
	  if (!TRoot[previndex["fin"]]) drawArcLink(ilink,0); else drawRoot();
	  }
	 var ilink=find_link_id(index);
	 console.log("index="+index+" previndex[deb]="+previndex["deb"]+" ilink="+ilink);
	 previndex["fin"]=index;
	 previndex["save"]=select_sentence.links[ilink].dest;
	 select_sentence.links[ilink].dest=previndex["deb"];
	 drawArcLink(ilink,1);
	 }
	else
	 {
	 if (ifTriggerSegment) $(document.body).trigger("drawlink_hover",[index]);

 	 var pathorig = MySvg.createPath() , pathdest = MySvg.createPath();
         for (var k in prevoverflow) if (prevoverflow[k]!=null) { MySvg.remove(prevoverflow[k]); prevoverflow[k]=null; }
         prevoverflow["orig"]=MySvg.path(null,pathorig.move(drawlinkTPosX[index].xdeb,OrigTextY+10).line(TextBox["word"].children[index].getComputedTextLength(),0,true).close(),
		{fill: 'none', stroke: 'black', strokeWidth: 4 });
	 var ilink=find_link_id(index);
	 if ((ilink!=-1)&&(select_sentence.links[ilink].dest>0)&&(select_sentence.links[ilink].dest<select_sentence.links.length))
          prevoverflow["dest"]=MySvg.path(null,pathdest.move(drawlinkTPosX[select_sentence.links[ilink].dest].xdeb,OrigTextY+10).
	 	line(TextBox["word"].children[select_sentence.links[ilink].dest].getComputedTextLength(),0,true).close(),
		{fill: 'none', stroke: 'red', strokeWidth: 4, strokeDasharray: "5,5"});
	 else prevoverflow["dest"]=null;
	 }
	} ;

function drawPhrase(svg)
{
// tableau des coordonnees xdeb et xfin des mots des phrases
MySvg=svg;
svg.configure(true); 

/* on supprime les ancien textbox s'ils existent */
for (var k in TextBox) if (TextBox[k]) { MySvg.remove(TextBox[k]); TextBox[k]=null; }

/* on construit les differents segments textes */ 
var texts_w = svg.createText() , texts_l = svg.createText() , texts_k = svg.createText(); 
for(var i=0;i<select_sentence.segments.length;i++)
 {
 var ch="",l_seg,l_lnk;
 // on cree la ligne de texte
 for(var j=select_sentence.segments[i].start;j<=select_sentence.segments[i].end;j++)
  ch+=""+select_sentence.tokens[j].word;
 // ch+=""+select_sentence.tokens[find_token_id(j)].word; 
 texts_w.span(ch,{id: "seg-wrd"+i , dx: DeltaX });  
 // on cree la ligne de POS
 l_seg=select_sentence.segments[i].label;
 texts_l.span(l_seg,{id: "seg-lbl"+i});
 // on cree la ligne de LINK 
 /* CAS PARTICULER DES PONCTUATIONS : PAS DE LIEN */
 if (l_seg=="PCT")
  {
  console.log("CAS PARTICULIER: on affiche pas les liens sur les ponctuations");
  l_lnk="-";
  }
 else
  {
  /* on cherche le label du lien s'il existe */
  for(var j=0;(j<select_sentence.links.length)&&(select_sentence.links[j].orig!=i);j++);
  if (j<select_sentence.links.length)
   {
   l_lnk=select_sentence.links[j].label;
   if (select_sentence.links[j].dest!=-1) TRoot[i]=false; else TRoot[i]=true;
   }
  else { TRoot[i]=false;  l_lnk="null"; }
  }
 texts_k.span(l_lnk,{id: "seg-lnk"+i});
 }

TextBox["word"] = svg.text(null,OrigTextX,OrigTextY,texts_w,{fontFamily: 'Verdana', fontSize: '24', fill: 'blue'});
TextBox["link"] = svg.text(null,OrigTextX,OrigTextY+30,texts_k,{fontFamily: 'Courier', fontSize: '20', fill: 'red'}); 
TextBox["pos"] = svg.text(null,OrigTextX,OrigTextY+60,texts_l,{fontFamily: 'Courier', fontSize: '20', fill: 'green'});

/* on repositionne les segments */
var dx_w=0,dx_l=0,dx_k=0,xdeb=OrigTextX;
for(var i=0;i<select_sentence.segments.length;i++)
 {
 drawlinkTPosX.push({xdeb: xdeb+DeltaX+dx_w, xfin: xdeb+DeltaX+dx_w+TextBox["word"].children[i].getComputedTextLength()});
 xdeb+=DeltaX+dx_w+TextBox["word"].children[i].getComputedTextLength();
 TextBox["word"].children[i].setAttribute('dx',DeltaX+dx_w);
 TextBox["pos"].children[i].setAttribute('dx',DeltaX+dx_l+(Math.floor(TextBox["word"].children[i].getComputedTextLength()/2)-Math.floor(TextBox["pos"].children[i].getComputedTextLength()/2)));
 //console.log('new dx for TextBox["pos"]: dx='+(DeltaX+dx_l+(Math.floor(TextBox["word"].children[i].getComputedTextLength()/2)-Math.floor(TextBox["pos"].children[i].getComputedTextLength()/2))));

 TextBox["link"].children[i].setAttribute('dx',DeltaX+dx_k+(Math.floor(TextBox["word"].children[i].getComputedTextLength()/2)-Math.floor(TextBox["link"].children[i].getComputedTextLength()/2)));
 var maxw=Math.max(TextBox["word"].children[i].getComputedTextLength(),TextBox["pos"].children[i].getComputedTextLength(),TextBox["link"].children[i].getComputedTextLength());
 if (TextBox["word"].children[i].getComputedTextLength()<maxw) dx_w=Math.floor((maxw-TextBox["word"].children[i].getComputedTextLength())/2); else dx_w=0;
 if (TextBox["pos"].children[i].getComputedTextLength()<maxw) dx_l=Math.floor((maxw-TextBox["pos"].children[i].getComputedTextLength())/2); else dx_l=0;
 if (TextBox["link"].children[i].getComputedTextLength()<maxw) dx_k=Math.floor((maxw-TextBox["link"].children[i].getComputedTextLength())/2); else dx_k=0;
 //console.log(TextBox["word"].children[i].innerHTML+'  dx_w='+dx_w+'  dx_l='+dx_l+'  dx_k='+dx_k);
 $(TextBox["word"].children[i]).mouseenter(function () { foverfloww(parseInt(this.id.slice(7)),true); });
 $(TextBox["pos"].children[i]).mouseenter(function () { foverfloww(parseInt(this.id.slice(7)),true); });
 $(TextBox["link"].children[i]).mouseenter(function () { foverfloww(parseInt(this.id.slice(7)),true); });


 $(document.body).keydown(function(event){ 
        console.log("Down: " + event.which);
	if (event.which==17) IfCtrl=true;
    });

 $(document.body).keyup(function(event){ 
        console.log("Up: " + event.which);
	if (event.which==17) IfCtrl=false;
    });


 var fselectw =  function (index,x,y) {
        for (var k in prevoverflow) if (prevoverflow[k]!=null) { MySvg.remove(prevoverflow[k]); prevoverflow[k]=null; }
        if ((IfCtrl==false)&&(previndex["deb"]==-1))
	 drawlink_openEditPopup(x, y, select_sentence.links[find_link_id(index)]);
	else
	 {
 	 var path = MySvg.createPath();
         if (previndex["deb"]==-1)
	  {
	  previndex["deb"]=index;
	  prevselected["deb"]=MySvg.path(null,path.move(drawlinkTPosX[index].xdeb,OrigTextY+8).line(TextBox["word"].children[index].getComputedTextLength(),0,true).close(),
		{fill: 'none', stroke: coul["deb"], strokeWidth: 6 });
	  }
	 else
	  {
	  var ilink=find_link_id(index);
	  if (ilink==-1) /* on rajoute le lien */
	   {
	   console.log("LINK : ORIG inconnu in links => "+index+" : we add a new link");
	   ilink=select_sentence.links.length;
	   select_sentence.links.push({"orig":index,"dest":previndex["deb"],"label":"null","status_link":"","status_lab":"","timestamp":"","target":0,"author":""});
	   }
	  console.log("Add an arc between: "+index+" and "+previndex["deb"]+"  ilink="+ilink);
	  corpus.saveCurrentVersion();
 
	  if (previndex["deb"]==index) { TRoot[index]=true; select_sentence.links[ilink].dest=-1; }
          else { TRoot[index]=false; select_sentence.links[ilink].dest=previndex["deb"]; }
	  select_sentence.links[ilink].status_link="G";
	  select_sentence.links[ilink].author=author;
	  MySvg.remove(prevselected["deb"]); prevselected["deb"]=null;
	  MySvg.remove(TArc[ilink]); TArc[ilink]=null;
	  drawLinks();
	  previndex["deb"]=-1; previndex["fin"]=-1;
	  $(".selected_sentence").trigger("refresh_drawlink");
	  drawlink_openEditPopup(x, y, select_sentence.links[find_link_id(index)]);
	  }
	 }
	} ;
 $(TextBox["word"].children[i]).click(function (event) { fselectw(parseInt(this.id.slice(7)),event.clientX,event.clientY); }); 
 $(TextBox["pos" ].children[i]).click(function (event) { fselectw(parseInt(this.id.slice(7)),event.clientX,event.clientY); });  
 $(TextBox["link"].children[i]).click(function (event) { fselectw(parseInt(this.id.slice(7)),event.clientX,event.clientY); });
 }
drawLinks();
$("#phrase_drawlink").get()[0].scrollLeft=DrawlinkScrolleft;
}

/*................................*/

/* we draw the links */

function drawArcLink(i,typarc)
{
var link=select_sentence.links[i];
var tspan=$('#phrase_drawlink svg text tspan');
var y=4+OrigTextY-$('#phrase_drawlink svg text')[0].getBBox().height;
var ytop=HautArc, delta=4, span=1;
var xfin=Math.round(drawlinkTPosX[link.orig].xdeb+(drawlinkTPosX[link.orig].xfin-drawlinkTPosX[link.orig].xdeb)/2);
var xdeb=Math.round(drawlinkTPosX[link.dest].xdeb+(drawlinkTPosX[link.dest].xfin-drawlinkTPosX[link.dest].xdeb)/2);
var xmil=Math.round((xfin-xdeb)/2); 
var path = MySvg.createPath();
var epaisseur,coul1,coul2;

if (typarc==0) { epaisseur=2; coul1="blue"; coul2="blue"; }
else { epaisseur=4; coul1="red"; coul2="red"; }
if ((TArc.length>i)&&(TArc[i]!=null)&&(TArc[i]!=undefined)) { MySvg.remove(TArc[i]); TArc[i]=null; }
/*if (Math.abs(link.orig-link.dest)>span) ytop+=HautArc; */

distlink=Math.abs(link.orig-link.dest);  
if (distlink==1) ytop=Math.floor(HautArc/2);
else
if (distlink==2) ytop=Math.floor(HautArc/1);
else ytop=(Math.abs(link.orig-link.dest))*DeltaArc+HautArc; 

//console.log("drawlink: "+link.orig+" (xdeb="+xdeb+") => "+link.dest+" (xfin="+xfin+") = "+link.label+"  y="+y); 
if (xdeb<xfin)
 TArc[i]=MySvg.path(null, path.move(xdeb+delta,y,false).curveC(0,0,xmil,ytop,((xfin-(xdeb+delta))-delta),0,true).line(1,-6,true).move(-1,6,true).line(-6,0,true).close(),
 	{fill: 'none', stroke: coul1, strokeWidth: epaisseur , strokeLinecap: "round"}); 
else
 TArc[i]=MySvg.path(null, path.move(xdeb-delta,y,false).curveC(0,0,xmil,ytop,(-((xdeb-delta)-xfin))+delta,0,true).line(-1,-6,true).move(1,6,true).line(6,0,true).close(),
 	{fill: 'none', stroke: coul2, strokeWidth: epaisseur , strokeLinecap: "round"}); 
}

function drawRoot()
{
var y=OrigTextY-(($('#phrase_drawlink svg text')[0].getBBox().height)+4);
/* on dessine les ROOT */
for (var j=0;j<TRoot.length;j++) if (TRoot[j])
 {
 var xdeb=Math.round(drawlinkTPosX[j].xdeb+(drawlinkTPosX[j].xfin-drawlinkTPosX[j].xdeb)/2);
 var path = MySvg.createPath(); 
 if ((TArc.length>j)&&(TArc[j]!=null)&&(TArc[j]!=undefined)) { MySvg.remove(TArc[j]); TArc[j]=null; }
 TArc[j]=MySvg.path(null,path.move(xdeb,y).line(0,-120,true).move(0,120,true).line(-2,-6,true).move(2,6,true).line(2,-6,true).close(),
 	{fill: 'none', stroke: 'blue', strokeWidth: 2 , strokeLinecap: "round"}); 
 }
}

function drawLinks()
{
for(var i=0;i<select_sentence.links.length;i++)
 if ((select_sentence.links[i].dest>=0)&&(select_sentence.links[i].dest<select_sentence.segments.length))
  {
  if ((select_sentence.segments[select_sentence.links[i].orig].label!="PCT") &&
      (select_sentence.segments[select_sentence.links[i].dest].label!="PCT")) drawArcLink(i,0);
  }
 else console.log(select_sentence.links[i]);
drawRoot();
}

/*................................................................*/

/* main */
//console.log(select_sentence); 
//select_sentence.links.sort(function(a, b) { return (Math.abs(a.orig-a.dest))-(Math.abs(b.orig-b.dest)); });
$('#phrase_drawlink').svg({onLoad: drawPhrase});
$('#phrase_drawlink').scroll(function(){ DrawlinkScrolleft=this.scrollLeft; /*console.log("DrawlinkScrolleft="+DrawlinkScrolleft);*/ }); 
$(document.body).off("segment_hover");
$(document.body).on("segment_hover",function(event,index)
	{
	console.log("survol segment:"+index);
	console.log(drawlinkTPosX);
	foverfloww(index,false);
	var width=$('#phrase_drawlink').get()[0].clientWidth;
        DrawlinkScrolleft=Math.max(0,drawlinkTPosX[index].xdeb-Math.round(width/2));
	$("#phrase_drawlink").get()[0].scrollLeft=DrawlinkScrolleft;
	//console.log("DrawlinkScrolleft="+DrawlinkScrolleft);
 });
}
  
