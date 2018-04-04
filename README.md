# Demo 4 Dashboard

Pipes and caves and particles!

## Hacking
    npm install
    npm build
    npm start

## Running on OpenShift
You can deploy and run this application on OpenShift by ensuring that you are
logged into your OpenShift instance (this can be minishift), and then run

```sh
$ npm run deploy
```

This will run the build to generate the site, then deploy it to OpenShift,
creating a BuildConfiguration, a Deployment, a Service and a Route, exposing
the application over port 8080.

## Development notes

 1. the particles will only line up with the graph SVG when the browser is at 1080p (fullscreen)
 2. we can hide the path tool (lower left) when ready
 3. graph svg can be replaced with the pipes when ready!  woot!
 4. the build uses Parcel, which imports SCSS files from a javascript entry point.  I know, it's weird, but it works well enough for a small project like this.  let mclayton know if any problems arise



