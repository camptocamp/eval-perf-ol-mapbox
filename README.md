# Testing performance of mapbox-gl and openlayers

## Overview

This projects aims at comparing performance of vector-tiles rendering.
It uses Selenium 4.0.0 as a software of ui test automation to gather metrics on performance.
It provides out-of-the-box statistics calculations and plotting of the results.

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
  * *version* : version of renderer

All timestamps are captured with [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) and has 20 microseconds precision (on firefox, it is slightly different on chrome).

## Usage

### Before lauching an experiment

* _If you want to run local styles_: In data/ type ```docker run --rm -it -v $(pwd):/data -p 8080: 80 klokantech/tileserver-gl 2017-07-03_europe_switzerland.mbtiles ```
You need to download those tiles from openmaptiles beforehand.

### Config file

Variables important in the experiment are stored in a JSON file: config.json
The structure of the JSON is the following:
* browser: currently supports firefox and chrome
* pathToOutDir: where the logs will be stored
* pathToOutDirSVG: where the svg will be stored
* renderers: an array which only supports "mapbox" and "openlayers" at this time
* nbTrials: number of trials by renderer
* testName: name of the experiment, please change it each time you are doing a new experiment
* initialZoom: an integer reprensenting the zoom level of the map,
* initialCenter: [lng, lat]
* paths: array of name of the function to call for the navigation path (in file src/selenium/navigationPaths), currently only supports 'path5sec', 'slowerScenario'. You can contribute by defining new navigationPaths
* overwritePreviousTests: if true, a new experiment will overwrite the results of the previous experiment with the same testName
* style: path to mapbox style json file
* olTime: specify a time for the release of ol and the corresponding ol-mapbox-style version, it must match a valid key in the ol_versions.json file
### The easy way

In a terminal go to _main_ subdirectory and type : ```npm run fullProcess```
It will automatically launch an experiment and draw the plots of the results. Must have a valid config.json file in the directory. It is possible to add the path to another config file as an argument.

### The hard way

If you want to have multiple config files for different tasks you can do it the following way:

#### Starting server

* in a terminal go to _main_ subfolder and type : ```npm start```
* If running ol version 4.x.x, type: ```npm run startOl4```
#### Gather metrics

* in a terminal go to _main_ subfolder and type : ```npm run launchExperiment PATH\_TO\_CONFIG\_FILE```
* type : ```npm run writeMetaPerf PATH\_TO\_CONFIG\_FILE```:
The first line will launch selenium and gather metrics. The second line will compute statistics for the files.

#### Visualizing experiments

* type : ```npm run drawMetaPerf PATH\_TO\_CONFIG\_FILE``` or 
  type : ```npm run drawMetaPerf PATHS\_TO\_METAPERF\_FILES```
* type : ```npm run drawPerfPlots PATH\_TO\_CONFIG\_FILE```

## Technical

The code is divided in three parts:
The first part is in NodeJS. It uses Selenium to control the browser. It injects javascript code in the browser whose result is wrapped in Promises.
The second part is the web application, coded in javascript and html. It provides abstraction over the mapboxMap and the openlayersMap and publishes functionaly of this abstracted as global variables (window.*function*). This allows Selenium to control the navigation path of the map. The performance recording part is coded there.
The third part is in nodeJS, it uses d3-node to plot results and export them as svg.

