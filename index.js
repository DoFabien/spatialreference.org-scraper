const fs = require('fs');
const request = require('sync-request');
const cheerio = require('cheerio');
const mkdirp = require('mkdirp');

//"EPSG:3857"
const projs = require('./projs.json');
const outputPath = './output';
const outputProjs = outputPath + "/projs.json"
const outputErrors = outputPath + "/errors.json"

let projections = [];
let errors = [];

const projFixs = {
        "EPSG:3857": "SR-ORG:6864",
        "IGNF:GEOPORTALFXX": "SR-ORG:6882",
        "IGNF:GEOPORTALGUF": "SR-ORG:6890",
        "IGNF:GEOPORTALANF": "SR-ORG:6888",
        "IGNF:GEOPORTALREU": "SR-ORG:6891",
        "IGNF:GEOPORTALPYF": "SR-ORG:6897",
        "IGNF:GEOPORTALMYT": "SR-ORG:6892",
        "IGNF:GEOPORTALNCL": "SR-ORG:6896"
}

function isInProjection(codeSRC){
    for (var i = 0; i < projections.length; i++){
        if (codeSRC === projections[i].code){
            return true;
        }
    }
    return false;
}

function getJsonProj(codeSRC){
    let code = codeSRC;
    if (projFixs[codeSRC]){
        code = projFixs[codeSRC];
    }
    let codeUrl = code.toLowerCase().replace(':','/');

    let json = {code:'',name:'', wgs84bounds:[], region:'', proj4:'', url:''};
    url = 'http://spatialreference.org/ref/'+codeUrl+'/';
    json.url = url;
    
    var res = request('GET', url);
     if (res.statusCode !== 200) {
         errors.push(JSON.stringify({codeerror: res.statusCode, epsg: codeSRC }));
         return null;
     }
            var $ = cheerio.load(res.getBody('utf8'));
            $('h1').filter(function(ind){
                var data = $(this);
                json.code = codeSRC //data.eq(0).text();
             
            });
            
              $('body p').first().filter(function(ind){
                var data = $(this);
                var name = data.eq(0).text().split("\n")[0].split('(')[0].trim();
                json.name = name;
            });
            
            $('ul').filter(function(ind){
                var data = $(this);
            
             for (var i = 0; i < data.children().length ; i++ ){
                 if ( /WGS84\sBounds:/.test(data.children().eq(i).text()) ){
                     var wgs84bounds = data.children().eq(i).text().split("\n")[0].split(':')[1];
                     wgs84bounds = wgs84bounds.split(',')
                     for (var j = 0; j < wgs84bounds.length; j++){
                        wgs84bounds[j] =  parseFloat(wgs84bounds[j])
                     }
                     
                      json.wgs84bounds = wgs84bounds;
                 }
                 
                  if ( /Area:/.test(data.children().eq(i).text()) ){
                      json.region = data.children().eq(i).text().split(':')[1].split(' - ')[0].trim();
                  }  
             } 
             
            return json;
            
            })
            
             var url2 = url+ 'proj4/'
             var res = request('GET', url2);
             json.proj4 = res.getBody('utf8').trim();
                 
    return json
    
}

        if (!fs.existsSync(outputPath)){
            mkdirp.sync(outputPath);
        }


    if (fs.existsSync(outputProjs)){
        projections = JSON.parse(fs.readFileSync(outputProjs, "utf8"));
    }
    

    for (var i = 0; i< projs.length; i++){
       
        if (!isInProjection(projs[i])){
             var currentProj = getJsonProj(projs[i]);
             if (currentProj && !isInProjection(projs[i])){
              projections.push(currentProj);
              console.log( projs[i], ' : Nouvelle projection');
             }
        } else {
            console.log( projs[i], ' : Déjà dans la sortie');
        }
    }

    const strProj = JSON.stringify(projections).replace(/},/g, '},\n')
    fs.writeFileSync(outputProjs, strProj);
    if (errors.length > 0){
        console.log('Oups, il y a des erreurs');
        fs.writeFileSync(outputErrors, errors.join(',\n'));
    } else {
        console.log(' :-) ')
    }

    
