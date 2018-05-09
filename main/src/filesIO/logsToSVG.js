const fs = require('fs');
const plotPerf = require('../visualization/plotPerf');

const PREFIX_TO_OUTDIR = '../../out/';
const PATH_TO_SVG_DIR = `${PREFIX_TO_OUTDIR}svg/`;
const LIBRARIES = ['openlayers', 'mapbox'];

function filenameWithoutExtension(filename) {
  return filename.split('.')[0];
}

function exportSVGFromDir(path, prefix) {
  const files = fs.readdirSync(path, 'utf-8');
  files.forEach((filename) => {
    const svg = plotPerf.SVGFromLogs(`${path}${files}`);
    fs.writeFile(`${PATH_TO_SVG_DIR}${prefix}${filenameWithoutExtension(filename)}.svg`, svg, 'utf-8');
  });
}

function exportLogs(lib) {
  exportSVGFromDir(`${PREFIX_TO_OUTDIR}${lib}/`, lib);
}

function exportAllSVG() {
  LIBRARIES.forEach(lib => exportLogs(lib));
}

module.exports.exportAllSVG = exportAllSVG;
exportAllSVG();
