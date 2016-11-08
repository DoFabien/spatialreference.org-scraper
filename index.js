var fs = require('fs');
var request = require('sync-request');
var cheerio = require('cheerio');

var projs = [];
    if (fs.existsSync('./output/projections.json')){
        projs = JSON.parse(fs.readFileSync("codeSRC.json", "utf8"));
    }

var projections = [];

var errors = [];

function isInProjection(codeSRC){
    for (var i = 0; i < projections.length; i++){
        if (codeSRC === projections[i].code){
            return true;
        }
    }
    return false;
}

function getJsonProj(codeSRC){ // EPSG:4326
    var codeUrl = codeSRC.toLowerCase();
    codeUrl = codeUrl.replace(':','/')
    
    var json = {code:'',name:'', wgs84bounds:[], region:'', proj4:'', url:''};
    url = 'http://spatialreference.org/ref/'+codeUrl+'/';
    json.url = url;
    
    var res = request('GET', url);
    // console.log(res.statusCode);
     if (res.statusCode !== 200) {
         errors.push(JSON.stringify({codeerror: res.statusCode, epsg: codeSRC }));
         return null;
     }
            var $ = cheerio.load(res.getBody('utf8'));
            $('h1').filter(function(ind){
                var data = $(this);
                json.code = data.eq(0).text();
             
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

    if (fs.existsSync('./output/projections.json')){
        projections = JSON.parse(fs.readFileSync("./output/projections.json", "utf8"));
    }

    for (var i = 0; i< projs.length; i++){
       
        if (!isInProjection(projs[i])){
            
             var currentProj = getJsonProj(projs[i]);
             if (currentProj && !isInProjection(projs[i])){
              console.log(projs[i] + ' Scraping... ' + i+1 +"/" + projs.length);
              //p.push(JSON.stringify(currentProj));
              projections.push(currentProj);
             } 
        } else {
                 console.log( projs[i] + ': déjà present')
             }

        
    }
    
    var strProj = JSON.stringify(projections)
   // strProj = strProj.replace('},','},\n')
    strProj = strProj.replace(/},/g, '},\n')
    fs.writeFileSync('./output/projections.json', strProj);
    fs.writeFileSync('./output/errors.json', errors.join(',\n'));
    if (errors.length > 0){
        console.log('Errors :')
            console.log(errors.join(',\n'));
    }
