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

### Accessing the image approval page

After running npm start, open [localhost:3000/approve/](http://localhost:3000/approve/) (it may be running on another port).

To enable the STORM button on the approve page, add `?controls` to the URL.  It should only be available to one user doing approvals.

### Using a fake Microservice B

There's a fake microservice B bundled with demo4-dashboard.  To launch using it, prepend `NODE_ENV=test` to the `npm start` command like so:

    NODE_ENV=test npm start

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
  jV
    stage.hideUI() // hides all UI elements
    stage.startTraining() // play the animation

Recommend shutting down the server for this mode, so messages don't come through.
