# spatialreference.org-scraper
 Scraper for spatialreference.org

## Install
```sh
 git clone https://github.com/DoFabien/spatialreference.org-scraper.git
 cd spatialreference.org-scraper
 npm install
```

## Use
Modify the file codeSRC.json with your own SRCs code (eg: EPSG:4326 ...) and run : npm start
The result is stored "output/projections.json"

## Example
```json
[{
"code":"EPSG:4326",
"name":"WGS 84",
"wgs84bounds":[-180,-90,180,90],
"region":"World","proj4":"+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
"url":"http://spatialreference.org/ref/epsg/4326/"
}, 
{...} 
]
```

