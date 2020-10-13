/* { "level": 0, "last": 0, "data": [{ "name": "temp", "json": "./temp/list_file.json" , "nb": 5952, "nbdone": 4 }] } */

// auto click, which makes debugging easy
function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function stripAuthorName(filename, authorname){
  while (filename.endsWith('.' + authorname)) {
    filename = filename.slice(0, -1-authorname.length);
  }
  return filename;
}

$(function() {

var xhttp = new XMLHttpRequest();
var tlevel=[];
var level=0;
var Tcoul = [ '#FF0000', '#FF4000', '#FF8000', '#FFBF00', '#FFFF00', '#E1F5A9', '#D0FA58', '#9AFE2E', '#3ADF00', '#04B404', '#04FF04' ];
var authorname="null";

// interface LOGIN
var n_div,n_table;
n_div=$('<div>').attr('id','conteneur');
n_div.append($('<div>').attr('id','entete').html("<h1 id='titre'> MACANNOT - Interface d'annotation de corpus - login </h1>"));
n_table=$('<table>').css('width','250px');
n_table.append($('<tr>').append($('<td>').text('id')).append($('<td>').append($('<input>').attr('id','chid').attr('type','text').attr('value', 'a'))));
n_table.append($('<tr>').append($('<td>').text('password')).append($('<td>').append($('<input>').attr('id','chmdp').attr('type','text').attr('value', 'a'))));  
n_table.append($('<tr>').append($('<td>').text(''))
  // .append($('<td>').append($('<button>').attr('id','gologin').text('Envoyer').click(function(event) {
  //   authorname=$("#chid").val();
  //   console.log("id="+authorname+"&mdp="+$("#chmdp").val());
  //   xhttp.open("GET", "annotator?id="+authorname+"&mdp="+$("#chmdp").val(),true);
  //   xhttp.send();
  // })))
  .append(
  $('<td>').append($('<button>').attr('id','goupload').text('Envoyer(test)').click(function(event) {
    authorname=$("#chid").val();
    console.log("id="+authorname+"&mdp="+$("#chmdp").val());
    xhttp.open("GET", "serverless?id="+authorname+"&mdp="+$("#chmdp").val(),true);
    xhttp.send();
  })))
);
n_div.append(n_table);
$('body').append(n_div);
////////
// FIXME: I am using auto-login for easy debugging. REMOVE it in production.
// eventFire(document.getElementById('gologin'), 'click');

xhttp.onreadystatechange = function()
 {
 console.log('Received data from server : state='+this.readyState+' status='+this.status); //+' response='+this.responseText);    

 if (this.readyState == 4 && this.status == 200)
  if (this.responseText.indexOf("IDOK")==0)
   {
   console.log(this.responseText);
   localStorage.setItem("validator_author", authorname);
   tlevel[0] = this.responseText.split(' ')[1]+"/list_file.json"  
  //  xhttp.open("GET", tlevel[0], true);
   xhttp.open("GET", "annotation?id="+authorname+"&path="+tlevel[0], true);
   xhttp.send();
   $("#div#conteneur").append();
   }
  else
  if (this.responseText=="IDKO") { $('body').append($('<h2>').text("Annotateur inconnu")); }
  else
  if (this.responseText.indexOf("CORPUS_GOLD")==0)
   {
   var newin=window.open("", "", "");
   $(newin.document.body).append($("<pre>").text(this.responseText)); 
   }
  else
   {
   var lfile = JSON.parse(this.responseText);
   $('body').html('');
 
   if (lfile.header!=undefined) /* on a un json corpus */
    {
    console.log("On a un json: "+lfile.header.filename+" with annotator="+lfile.annotation.name+" (authorname="+authorname+")");
    display_interface_annotation();
    var corpus_test = new Corpus(lfile,xhttp,tlevel[0]);
    console.log("POPO"); console.log(corpus_test);
    validator = new ValidateList(corpus_test, /*true*/ false /* mode lien */); 
    validator.saveAuthorInLocalStorage(authorname);
    // $("button#annotation_title").text(_string("titles", "annotation_title", validator.language) + lfile.header.filename);
    $("button#annotation_title").text("Download: " + lfile.header.filename)
    }
   else
    {
    var n_cont=$('<div>').attr('id','conteneur');
    var n_cont2=$('<div>').attr('id','entete');
    n_cont2.append($('<h1>').attr('id','titre').text("MACANNOT - Interface d'annotation de corpus"));
    n_cont2.append($('<h2>').append($('<span>').attr('id','annotateur').css("position","fixed").css("left","40%").text("Annotateur: "+authorname)));
    n_cont.append(n_cont2); 
    n_cont2=$('<div>').attr('id','choixlu');
    n_cont2.append($('<button>').text("BACK").click(function (event)
     {
       console.log(level, tlevel);
     if ((level>0)&&(tlevel[level-1]!=undefined)) {
       console.log('file='+tlevel[level-1]+" annotator="+authorname+" filename="+stripAuthorName(tlevel[level-1]));
       xhttp.open("GET", "annotation?id="+authorname+"&path="+stripAuthorName(tlevel[level-1]), true);
      //  xhttp.open("GET", tlevel[level-1]);
       xhttp.send();
       level -= 1;
      }
     } ));
/*
    n_cont2.append($('<button>').text("OUTPUT CORPUS").css("position","fixed").css("right","6%").click(function (event) 
     {
     xhttp.open("GET","generatecorpus"); xhttp.send();
     } ));
*/
    n_cont.append(n_cont2);
    $('body').append(n_cont);

    // c'est pas le dernier on fait une table 
    if (lfile.last==0)
     {
     var i,j,nbcol;
     /* on la tri selon le champs name */
     lfile.data.sort(function(a,b) { if (a.name>b.name) return 1; else if (a.name<b.name) return -1; else return 0; }); 
     var table = $('<table>').attr("class","tabstat");
     if (lfile.data.length<20) nbcol=4; else  if (lfile.data.length<40) nbcol=6; else nbcol=8; 
     for(i = 0; i < lfile.data.length; )
      {
      var row = $('<tr>');
      for(j=0;(j<nbcol)&&(i<lfile.data.length);j++,i++)
       {
       var cell = $('<td>') , moy=(lfile.data[i].nbdone*100)/lfile.data[i].nb;
       if (lfile.data[i].prec==undefined)
      //  cell.append($('<div>').append($('<h3>').text(lfile.data[i].name))).append($('<div>').text(''+lfile.data[i].nbdone+'/'+lfile.data[i].nb+' ('+moy.toFixed(1)+'%)')).append($('<div>').text('precision: -'));
       cell.append($('<div>').append($('<h3>').text(lfile.data[i].name))).append($('<div>').text(''+lfile.data[i].nbdone+'/'+lfile.data[i].nb+' ('+moy.toFixed(1)+'%)'));
       else
        cell.append($('<div>').append($('<h3>').text(lfile.data[i].name))).append($('<div>').text(''+lfile.data[i].nbdone+'/'+lfile.data[i].nb+' ('+moy.toFixed(1)+'%)')).append($('<div>').text('precision: '+lfile.data[i].prec+'%'));
       cell.attr('id','c'+i).attr('class','choix').css('background-color', Tcoul[Math.floor(moy/10)]);
       cell.click(function(event)
        {
        $(this).css('background-color','blue');
        var i=$(this).attr('id').split('c')[1];
        console.log('file='+lfile.data[i].json+" annotator="+authorname+" filename="+stripAuthorName(lfile.data[i].json, authorname));
        level=lfile.level; tlevel[level]=lfile.data[i].json;
        xhttp.open("GET", "annotation?id="+authorname+"&path="+stripAuthorName(lfile.data[i].json, authorname), true);
        xhttp.send();
        });
       cell.mouseover(function(event)
        {
        var nt=this;
        $('.choix').each(function(index, node)
         {
         if ($(node).attr('id')==$(nt).attr('id')) { $(nt).css("background-color","#f5f5f5"); } 
         else
          {
          var i=$(node).attr('id').split('c')[1];
          var moy=(lfile.data[i].nbdone*100)/lfile.data[i].nb;
          $(node).css('background-color', Tcoul[Math.floor(moy/10)]); 
          }
         } );
        })  
       row.append(cell);
       }
      table.append(row);
      }
     }
    else // c'est le dernier on fait une liste dans un tableau
     {
     lfile.data.sort(function (a,b) { return a.nbdone-b.nbdone; });
     var table = $('<table>').attr("class","tabstat");
     for(var i = 0 , nb=0 ; i < lfile.data.length; i++ )
      {
      var row = $('<tr>').attr('id','f'+i).attr('class','jsonfile');
      row.append($('<td>').attr('class','idfile').text(""+(i+1)));
      row.append($('<td>').attr('class','namefile').text(lfile.data[i].name));
      if (lfile.data[i].nbdone==1) row.css('background-color','green'); else row.css('background-color','red');
      row.click(function(event)
       {
       $(this).css('background-color','blue');
       var i=$(this).attr('id').split('f')[1];
       console.log('file='+lfile.data[i].json+" annotator="+authorname+" filename="+stripAuthorName(lfile.data[i].json, authorname));
       level=lfile.level; tlevel[level]=lfile.data[i].json;
       xhttp.open("GET", "annotation?id="+authorname+"&path="+stripAuthorName(lfile.data[i].json, authorname), true);
       xhttp.send();
       });
      row.mouseover(function(event)
       {
       var nt=this;
       $('.jsonfile').each(function(index, node)
        {
        if ($(node).attr('id')==$(nt).attr('id')) { $(nt).css("background-color","#f5f5f5"); } 
        else
         {
         var i=$(node).attr('id').split('f')[1];
         if (lfile.data[i].nbdone==1) $(node).css('background-color','green'); else $(node).css('background-color','red'); 
         }
        } );
       })  
      table.append(row);
      }
     }
  
    $('#choixlu').append(table);
    table.attr('id','tablelu');
    table.attr('border', 2);
    }
   }
 };

} ); 
 
