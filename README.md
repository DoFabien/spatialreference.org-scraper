# Spatialreference.org Scraper 


## Install & execute
```sh
 git clone https://github.com/DoFabien/spatialreference.org-scraper.git
 cd spatialreference.org-scraper
 npm install
```

## Usage
A partir des codes SRID dans ./projs.js, retourne un tableau d'objets :

[
    {"code":"EPSG:4326",
    "name":"WGS 84",
    "wgs84bounds":[-180,-90,180,90],
    "region":"World",
    "proj4":"+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    "url":"http://spatialreference.org/ref/epsg/4326/"
    },
    {...}
]

Par défaut, la sortie est dans ./output/projs.json