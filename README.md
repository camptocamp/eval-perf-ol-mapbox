# Testing performance of mapbox-gl and openlayers

## Overview

### Literature review
Reviewing the literature confirmed that Quality of Experience (QoE) is a complicated problem.
Apparently FPS is relevant for reactive games, network latency seems the main issue for mobile online games.
In video streaming, FPS does not matter as much as video resolution.
A study on Online First Person Shooter showed that ping and jitter (variance of ping) can be the most predictive correlates of user experience.
Papers based on those conclusion are listed in bibliography.bib.
Type their titles on google scholar should provide you the pdf or at least the doi for [scihub](http://www.sci-hub.tw)

### Metrics we can use
We have to determine what matters most for a web map application since I did not see specific tests on the litterature.
I think fluidity and reactivity are the most important. The main issues could be:
- lag while dragging -> low FPS in average
- initial lag when issuing a command (zooming or changing the style) -> variance in FPS ? 

We put aside network issues -> knowing that it can have a great impact on QoE but there would be no difference for ol and mapbox.

To summarize:
- 1. FPS/render time
- 2. variance in 1.
- 3. Other ?

### format of the results

The results are put in a JSON file whose structure is the following:
* **eventlogs**
  * *doubleClickTimes* : a list of timestamps corresponding to double click events
  * *dragEvents* : list of *timeStampsOfMoves* object
    * *timeStampsOfMoves* : list of timestamps, indicating that a drag occured (empty lists means no drag)
  * *frameTimes* : list of timeStamps, corresponding to the beginning of a frame
  * *instantFPS* : list of fps calculated on one frame (same size as frameTimes, = 1000 / timeBetweenFrames)
  * *timeBetweenFrames* : list of the same size than *frameTimes* is equal to (*frameTimes*[i] - *frameTimes*[i-1])
  * **renderTimes** : list of objects created each time the renderer works
    * *afterRender* : timestamp before rendering
    * *beforeRender* : timestamp at the end of rendering

All timestamps are captured with [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) and has 20 microseconds precision.

## Usage

### Before lauching an experiment
 Warning : tileserver use node v6 and selenium-webdriver use node v8

* in data/ type ```nvm exec v6.14.1 tileserver-gl 2017-07-03_europe_switzerland.mbtiles ```
You need to download those tiles from openmaptiles beforehand.
* in main/ type npm start

### Gather metrics

* in src/launch/ type : ```node --require babel-register main.js``` :
it will launch an experiment (you can change parameters in the javascript main.js file
* in src/filesIO/ type : ```node --require babel-register metaPerfWriter.js PATHS_TO_DIR```:
Where PATHS\_TO\_DIR are any number of arguments pointing to any register containing **only** perfLogs files obtained while running selenium. It will compute statistics for the files.

### Visualizing experiments

* In src/visualization/ type : ```node --require babel-register metaPerfBoxPlot.js PATHS_TO_INPUT_DIR PATH_TO_OUTPUT_DIR```:
  * Where PATHS\_TO\_INPUT\_DIR is any number of arguments pointing to metaPerfFiles and 
  * PATH\_TO\_OUTPUT\_DIR is only one **required** argument where the file MetaPerf.svg will be written
* In src/filesIO/ type : ```node --require babel-register logsToSVG.js PATH_TO_INPUT_DIR PATH_TO_OUTPUT_DIR```
  * Where PATH\_TO\_INPUT\_DIR is the path to a directory containing mapbox/ and openlayers/ as subdirectories each one containing perfLogs files
  * Where PATH\_TO\_OUTPUT\_DIR  is the path to the dir where the svg files will be written
