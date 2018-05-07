const fs = require('fs');
const plotPerf = require('../visualization/plotPerf');

const PREFIX_TO_OUTDIR = '../../out/';
const PATH_TO_SVG_DIR = `${PREFIX_TO_OUTDIR}svg/`;
const PATH_TO_MAPBOX_LOGS = `${PREFIX_TO_OUTDIR}mapbox/`;
const PATH_TO_OPENLAYERS_LOGS = `${PREFIX_TO_OUTDIR}openlayers/`;

function filenameWithoutExtension(filename){
  return filename.split('.')[0];
}

function exportSVGFromDir(path, prefix) {
  const files = fs.readdirSync(path, 'utf-8');
  files.forEach((filename) => {
    const svg = plotPerf.SVGFromLogs(`${path}${files}`);
    fs.writeFile(`${PATH_TO_SVG_DIR}${prefix}${filenameWithoutExtension(filename)}.svg`, svg, 'utf-8');
  });
}

function exportOpenLayersLogs() {
  exportSVGFromDir(PATH_TO_OPENLAYERS_LOGS, 'openlayers');
}

function exportMapboxLogs() {
  exportSVGFromDir(PATH_TO_MAPBOX_LOGS, 'mapbox');
}

function exportAllSVG() {
  exportMapboxLogs();
  exportOpenLayersLogs();
}

module.exports.exportAllSVG = exportAllSVG;
exportAllSVG();
