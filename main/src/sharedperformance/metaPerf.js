import * as ss from 'simple-statistics';
import { LogsReader } from '../filesIO/logsReader';
import { metaPerfLogsFileName } from '../filesIO/utils';

const fs = require('fs');

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
function isOutlier(firstQuartile, thirdQuartile, value) {
  const IQR = thirdQuartile - firstQuartile;
  const below = value < (firstQuartile) - (1.5 * IQR);
  const above = value > (thirdQuartile) + (1.5 * IQR);
  return below || above;
}

function metaperf(pathToDir) {
  const files = fs.readdirSync(pathToDir);
  const filesFiltered = files.filter(name => name !== metaPerfLogsFileName);
  const logsReader = filesFiltered.map(name => new LogsReader(`${pathToDir}${name}`));
  const FPSArray = logsReader.map(logReader => logReader.getInstantFPS());
  const meanFPSArray = FPSArray.map(instantFPS => ss.mean(instantFPS));
  const FPSVariances = FPSArray.map(instantFPS => ss.variance(instantFPS));
  const filenameOfWorst = filesFiltered[indexOfMin(meanFPSArray)];
  const meanFPSBoxPlotWithOutliers = computeBoxPlotStats(meanFPSArray);
  const varianceFPSBoxPlot = computeBoxPlotStats(FPSVariances);
  const meanFPSArrayRelevant = meanFPSArray.filter(meanFPS => !isOutlier(
    meanFPSBoxPlotWithOutliers.firstQuartile,
    meanFPSBoxPlotWithOutliers.thirdQuartile,
    meanFPS,
  ));
  const meanFPSBoxPlot = computeBoxPlotStats(meanFPSArrayRelevant);
  const sampleSize = filesFiltered.length;
  const outliers = sampleSize - meanFPSArrayRelevant.length;
  return {
    meanFPSArray,
    FPSVariances,
    filenameOfWorst,
    meanFPSBoxPlotWithOutliers,
    varianceFPSBoxPlot,
    sampleSize,
    meanFPSBoxPlot,
    outliers,
  };
}

export { metaperf, metaPerfLogsFileName };
