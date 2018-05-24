import * as ss from 'simple-statistics';
import { LogsReader } from '../filesIO/logsReader';

const fs = require('fs');
const metaPerfLogsFileName = 'metaPerf.json';

function indexOfMin(array) {
  let min = Infinity;
  let minIndex = -1;
  array.forEach((element, index) => {
    if (element < min) {
      min = element;
      minIndex = index;
    }
  });
  return minIndex;
}

function computeBoxPlotStats(array) {
  const firstQuartile = ss.quantile(array, 0.25);
  const median = ss.median(array);
  const thirdQuartile = ss.quantile(array, 0.75);
  const min = ss.min(array);
  const max = ss.max(array);
  const standardDeviation = ss.standardDeviation(array);
  return {
    min, firstQuartile, median, thirdQuartile, max, standardDeviation,
  };
}

function metaperf(pathToDir) {
  const files = fs.readdirSync(pathToDir);
  const filesFiltered = files.filter(name => name !== metaPerfLogsFileName);
  const logsReader = filesFiltered.map(name => new LogsReader(`${pathToDir}${name}`));
  const FPSArray = logsReader.map(logReader => logReader.getInstantFPS());
  const meanFPSArray = FPSArray.map(instantFPS => ss.mean(instantFPS));
  const FPSVariances = FPSArray.map(instantFPS => ss.variance(instantFPS)); 
  const filenameOfWorst = filesFiltered[indexOfMin(meanFPSArray)];
  const meanFPSBoxPlot = computeBoxPlotStats(meanFPSArray);
  const varianceFPSBoxPlot = computeBoxPlotStats(FPSVariances);
  const sampleSize = filesFiltered.length;

  return {
    meanFPSArray, FPSVariances, filenameOfWorst, meanFPSBoxPlot, varianceFPSBoxPlot, sampleSize,
  };
}

export { metaperf, metaPerfLogsFileName };
