// Interface d'annotation - MACANNOT - FRED 0218
//

var http = require('http'), fs = require('fs'), mime = require('mime'), url_utils = require('url') , child_process = require('child_process');
 
//Lets define a server and a port we want to listen to
//const SERVEUR='127.0.0.1';
const SERVEUR='0.0.0.0';
const PORT=8888;

const CHDIRE_INTE='interface';
const CHDIRE_TOOL='tools';
const CHDIRE_DATA='data';

function erreur(res,mesg)
{
res.writeHead(404, {'Content-Type': 'text/plain'});
res.end(mesg);
}

/*................................................................*/
// liste des annotateurs autorisés avec login (id) et mot de passe (mdp)
var Table_Annotator =
	[
	{ id : "f" , mdp : "f" , data_dir : CHDIRE_DATA } ,
	{ id : "a", mdp : "a" , data_dir : CHDIRE_DATA }
	] ;

function annotator_data_dir(id)
{
for(var i=0;i<Table_Annotator.length;i++)
 if (Table_Annotator[i].id==id) return Table_Annotator[i].data_dir;
erreur("unknown annotator id: "+id);
}

/*................................................................*/

(function ()
{
http.createServer(function (req, res) {
url = url_utils.parse(req.url)
console.log(req.url+'  '+url.pathname+'  '+req.method);
 
 if (req.url == '/') erreur(res,"ERROR - PAGE NOT FOUND");
 else
 if ((req.url.indexOf('.html')!=-1)||(req.url.indexOf('/css/')==0)||(req.url.indexOf('/js/')==0)||(req.url.indexOf(CHDIRE_DATA)==1))
  {
  var fname;
  if (req.url.indexOf(CHDIRE_DATA)==1) fname="."+req.url.split('?')[0];
  else fname=CHDIRE_INTE + req.url.split('?')[0];
  console.log("sending: "+fname); 
  if(fs.existsSync(fname)) { res.writeHead(200, {'Content-Type': mime.lookup(fname)}); res.end(fs.readFileSync(fname)); }
  else erreur(res,"Sorry, can't find: "+req.url);
  }
 else
 if ((req.url.indexOf('/annotator?id=')==0)&&(req.url.indexOf('&mdp=')!=-1))
  {
  // /annotator?id=gg&mdp=ff
  var id,mdp,i,mesg;
  id=req.url.split('?')[1].split('&')[0].split('=')[1];
  mdp=req.url.split('?')[1].split('&')[1].split('=')[1];
  console.log("id="+id+"  mdp="+mdp);
  for(i=0;(i<Table_Annotator.length)&&((Table_Annotator[i].id!=id)||(Table_Annotator[i].mdp!=mdp));i++);
  if (i!=Table_Annotator.length) { res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('IDOK '+Table_Annotator[i].data_dir); }
  else { res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('UNKNOWN'); } 
  }
 else
 if((url.pathname == '/commit')&&(req.method=='POST'))
  {
  var mydata='';
  req.on('data', function (data) { mydata += data; });
  req.on('end', 
        function ()
        {
	console.log("mydata="+mydata); 
	var dajs = JSON.parse(mydata);
        console.log("received: "+dajs.header.filename+" - annotated by : "+dajs.annotation.name); 
	var t = new Date();
	var dirdata=annotator_data_dir(dajs.annotation.name);
	console.log("  => data directory for annotator '"+dajs.annotation.name+"' is: "+dirdata);
	var fname = dirdata+"/"+dajs.header.filename;
	fs.writeFile(fname+"."+t.getTime(),mydata , function(err) { if(err) { return console.log(err); } });
	fs.writeFile(fname,mydata , function(err) { if(err) { return console.log(err); } }); // maintenant on ecrase l'ancien fichier hyp
        /* on verifie que tous les exemples sont bien GOLD avant de mettre l'etiquette DONE sur le fichier */
        for (var i=0, gold=true;(i<dajs.documents.length)&&(gold);i++)
	 {
         //console.log('id='+dajs.documents[i].id);
	 gold=false;
	 for (var j=0;(j<dajs.documents[i].segments.length)&&(!gold);j++)
	  if ((dajs.documents[i].segments[j].status_seg=='G')||(dajs.documents[i].segments[j].status_lab=='G')) gold=true;
	 }
        if (gold)
	 {
	 fs.writeFile(fname+".done",mydata , function(err)
          {
	  if(err) { return console.log(err); }
	  /* on met a jour les perf si defini */
          var perfrep = fname.split('/');
          var perfrepname=perfrep[0];
          for (var i=1;i<perfrep.length-1;i++) perfrepname=perfrepname+'/'+perfrep[i];

	  console.log('find ./'+dirdata+' -name "*.json" -print | grep -v "list_file.json" | '+CHDIRE_TOOL+'/make_json_list_files -prefix .');
	  //child_process.execFile('find ./'+dirdata+' -name "*.json" -print | grep -v "list_file.json" | '+CHDIRE_TOOL+'/make_json_list_files -prefix .',[],function (err, result)
	  child_process.execFile(CHDIRE_TOOL+'/update_list_file.sh', [dirdata], function (err, result)
           {
	   console.log('- update files : err='+err+' result='+result);
           res.writeHead(200, {'Content-Type': mime.lookup(dirdata+'/list_file.json')});
           res.end(fs.readFileSync(dirdata+'/list_file.json'));
	   }); 
	  });
	 }
	else { res.writeHead(200, {'Content-Type': mime.lookup(dirdata+'/list_file.json')}); res.end(fs.readFileSync(dirdata+'/list_file.json'));}
        }
     );
  }
 else
  { // le fichier n'a pas été trouvé
  erreur(res,"ERROR: page not found");
  }
}).listen(PORT, SERVEUR);

console.log('Server '+SERVEUR+' listening on port: '+PORT);
})();
 
