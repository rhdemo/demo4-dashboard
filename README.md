# Demo 4 Dashboard

Pipes and caves and particles!

For the demo2 dashboard (forked from this one), see [rhdemo/demo2-dashboard](https://github.com/rhdemo/demo2-dashboard).

## Hacking

    npm install
    npm start

## Development notes

 1. the particles will only line up with the graph SVG when the browser is at 3542x1144 resolution ([guide: setting up this resolution in Chrome](doc/custom-device.mp4))
 2. we can hide the path tool (lower left) when ready
 3. graph svg can be replaced with the pipes when ready!  woot!
 4. the build uses Parcel, which imports SCSS files from a javascript entry point.  I know, it's weird, but it works well enough for a small project like this.  let mclayton know if any problems arise

## Manual steps for demo pieces

Here are some commands to run in the JS console to manually trigger actions needed by certain demo pieces.

### Send a sample input image into the pipe

    // specific image
    stage._pushImage("https://upload.wikimedia.org/wikipedia/commons/4/4d/Crayones_cera.jpg")

    // no arg defaults to Andrés, of course
    stage._pushImage()

### Send a stream of particles through the pipes

    stage._initMovingParticles()

### Training simulation

To run the visualiation of machine learning training:

    stage.hideUI() // hides all UI elements
    stage.startTraining() // play the animation

