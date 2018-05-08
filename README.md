# Testing performance of mapbox-gl and openlayers

## Literature review
Reviewing the literature confirmed that Quality of Experience (QoE) is a complicated problem.
Apparently FPS is relevant for reactive games, network latency seems the main issue for mobile online games.
In video streaming, FPS does not matter as much as video resolution.
A study on Online First Person Shooter showed that ping and jitter (variance of ping) can be the most predictive correlates of user experience.

## Metrics we can use
We have to determine what matters most for a web map application since I did not see specific tests on the litterature.
I think fluidity and reactivity are the most important. The main issues could be:
- lag while dragging -> low FPS in average
- initial lag when issuing a command (zooming or changing the style) -> variance in FPS ? 

We put aside network issues -> knowing that it can have a great impact on QoE but there would be no difference for ol and mapbox.

To resume:
- 1. FPS/render time
- 2. variance in 1.
- 3. Other ?
