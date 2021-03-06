import * as ss from 'simple-statistics';
import { LogsReader } from '../filesIO/logsReader';
import { metaPerfLogsFileName, getFileNamesOfLogs } from '../filesIO/utils';

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

function getMeanFPS(logsReader) {
  const timeBetweenFrames = logsReader.getTimeBetweenFrames();
  const totalTime = ss.sum(timeBetweenFrames);
  const numberOfFrames = timeBetweenFrames.length;
  const meanFrameTime = totalTime / numberOfFrames;
  return 1000 / meanFrameTime;
}

function getVersion(logsReaders) {
  const version = logsReaders[0].getVersion();
  logsReaders.slice(1, logsReaders.length).forEach((logsReader) => {
    const version2 = logsReader.getVersion();
    if (version !== version2) {
      throw new Error(`different versions: ${version} and ${version2} in same folders,<
       probably an issue in the generation of data`);
    }
  });
  return version;
}

function metaperf(pathToDir) {
  const files = getFileNamesOfLogs(pathToDir);
  const logsReaders = files.map(name => new LogsReader(`${pathToDir}${name}`));
  const maxRenderArray = logsReaders.map(logsReader => logsReader.getMaxRenderTime());
  const FPSArray = logsReaders.map(logsReader => logsReader.getInstantFPS());
  const meanFPSArray = logsReaders.map(logsReader => getMeanFPS(logsReader));
  const FPSVariances = FPSArray.map(instantFPS => ss.variance(instantFPS));
  const filenameOfWorst = files[indexOfMin(meanFPSArray)];
  const meanFPSBoxPlotWithOutliers = computeBoxPlotStats(meanFPSArray);
  const varianceFPSBoxPlot = computeBoxPlotStats(FPSVariances);
  const meanFPSArrayRelevant = meanFPSArray.filter(meanFPS => !isOutlier(
    meanFPSBoxPlotWithOutliers.firstQuartile,
    meanFPSBoxPlotWithOutliers.thirdQuartile,
    meanFPS,
  ));
  const meanFPSBoxPlot = computeBoxPlotStats(meanFPSArrayRelevant);
  const sampleSize = files.length;
  const outliers = sampleSize - meanFPSArrayRelevant.length;
  const maxRenderBoxPlotWithOutliers = computeBoxPlotStats(maxRenderArray);
  const maxRenderBoxPlot = computeBoxPlotStats(maxRenderArray.filter(maxRender => !isOutlier(
    maxRenderBoxPlotWithOutliers.firstQuartile,
    maxRenderBoxPlotWithOutliers.thirdQuartile,
    maxRender,
  )));
  const version = logsReaders[0].getVersion();
  return {
    meanFPSArray,
    FPSVariances,
    filenameOfWorst,
    meanFPSBoxPlotWithOutliers,
    varianceFPSBoxPlot,
    sampleSize,
    meanFPSBoxPlot,
    outliers,
    version,
    maxRenderBoxPlot,
  };
}

export { metaperf, metaPerfLogsFileName };
