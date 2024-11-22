# This is a throwaway container just for the proof of concept. It assumes that you're building it wil the modified
# node-mbtiles repo in a sibling folder, and with the built tile dbs in the tiles folder. (These can be obtained
# by sftp from the arbomap server.)
FROM node:20

COPY node-mbtiles src

# copy db tiles
COPY arbomap/tiles/ src/tiles/

WORKDIR /src

ENTRYPOINT ls && node main.js --databases "admin0;tiles/admin0.mbtiles,admin1;tiles/admin1.mbtiles,admin2;tiles/admin2.mbtiles"