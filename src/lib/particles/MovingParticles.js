import * as THREE from "three";
import { filter, max, min } from "lodash";
import Actor from "./Actor.js";
import { makeLogger } from "../logging/Logger.js";
import ShaderLoader from "./ShaderLoader.js";
import free from "./Free.js";

const log = makeLogger("MovingParticles");

export default class MovingParticles extends Actor {
  constructor({
    stage,
    paths = {},
    probability = [],
    color,
    image,
    speed = 0.007,
    pointCount = 140,
    pointSize = 8,
    loopParticles = false
  } = {}) {
    super(stage);

    this.probability = probability;

    this.completedCallbacks = [];

    this.paths = paths;
    this.paths.length = this.paths.nodes * this.paths.components;
    this.color = color;
    this.image = image;

    this.pointCount = pointCount;
    this.speed = speed;
    this.delaySpread = 1.0;
    this.size = pointSize;
    this.spread = 2;
    this.loopParticles = loopParticles;
    this.progress = 0;

    log("created");

    this._initRaycasting();
    this._initParticles();

    this._raycastPaths();
  }
  update() {
    this._updateMove();
    this._updateProgress();
    this._checkProgress();
  }
  destroy() {
    free(this.stage.scene, this.raycastPlane);
    free(this.stage.scene, this.points);
    this.destroyed = true;
  }

  _updateMove() {
    let x = 0;
    let y = 0;
    let p = 0;
    let path_i = 0;
    let pn = 0;
    let pathProgress = 0;
    let a = 0;
    let aa = 0;
    let x1i = 0;
    let x2i = 0;
    let y1i = 0;
    let y2i = 0;
    let pvar = 0;
    let xvar = 0;
    let yvar = 0;
    let p1 = new Float32Array(2); // "vec2"
    let p2 = new Float32Array(2); // "vec2"
    let variation = 0;
    let progress = 0;
    let posArray = this.points.geometry.attributes.position.array;
    let pathArray = this.points.geometry.attributes.path.array;
    let variationArray = this.points.geometry.attributes.variation.array;
    let progressArray = this.points.geometry.attributes.progress.array;

    for (let i = 0, i3 = 0; i3 < posArray.length; i++, i3 += 3) {
      variation = variationArray[i];
      progress = progressArray[i];

      p = Math.min(1, Math.max(0, progress)); // clamp to 0..1
      pn = pathArray[i];

      path_i = this.paths.length * pn;

      // x = posArray[i3];
      // y = posArray[i3 + 1];

      pathProgress =
        p *
        (this.paths.nodes - this.paths.components + 1) *
        this.paths.components;

      x1i = path_i + Math.floor(pathProgress / 2.0) * 2;
      y1i = x1i + 1;
      x2i = x1i + this.paths.components;
      y2i = x2i + 1;

      aa = p * (this.paths.nodes - this.paths.components + 1);
      a = aa - Math.trunc(aa); // get decimal part

      pvar =
        (progress + this.moveDelay.array[i] + variation) * variation * 10.0;
      xvar = variation * this.spread * (Math.sin(pvar) + Math.cos(pvar));
      yvar = variation * this.spread * (Math.cos(pvar) - Math.sin(pvar));

      p1[0] = this.paths.coordinates[x1i] + xvar;
      p1[1] = this.paths.coordinates[y1i] + yvar;
      p2[0] = this.paths.coordinates[x2i] + xvar;
      p2[1] = this.paths.coordinates[y2i] + yvar;

      posArray[i3] = (1 - a) * p1[0] + a * p2[0];
      posArray[i3 + 1] = (1 - a) * p1[1] + a * p2[1];
    }

    this.points.geometry.attributes.position.needsUpdate = true;

    // vec2 pointOnPath(float p, int pn, bool hideStationary) {
    //   p = clamp(p, 0.0, 1.0);

    //   int path_i = PATH_LENGTH * pn;
    //   float path_progress = p * float((PATH_NODES - PATH_COMPONENTS + 1) * PATH_COMPONENTS);
    //   int x1i = path_i + int(path_progress / 2.0) * 2;
    //   int y1i = x1i + 1;
    //   int x2i = x1i + PATH_COMPONENTS;
    //   int y2i = x2i + 1;

    //   float a = fract(p * float((PATH_NODES - PATH_COMPONENTS + 1)));

    //   // vary the positions per particle to spread them out out
    //   float pvar = (progress + moveDelay + variation) * variation * 10.0;
    //   float xvar = variation * SPREAD * (sin(pvar) + cos(pvar));
    //   float yvar = variation * SPREAD * (cos(pvar) - sin(pvar));

    //   vec2 p1 = vec2(paths[x1i] + xvar, paths[y1i] + yvar);
    //   vec2 p2 = vec2(paths[x2i] + xvar, paths[y2i] + yvar);

    //   // if the particle isn't moving, this means that it has reached the end of
    //   // its path, but it was on a path that has padding end points.  we don't
    //   // want those particles to stay visible just sitting there, so let our
    //   // friend the fragment shader know to discard this particle with
    //   if (hideStationary && p1 == p2) {
    //     return vec2(DISCARD_THIS, 0.0);
    //   }

    //   vec2 pos = mix( p1, p2, a );

    //   return pos;
    // }
  }

  _updateProgress() {
    const progressAttr = this.geometry.attributes.progress;

    this.progress += this.speed;

    for (let i = 0; i < progressAttr.array.length; ++i) {
      progressAttr.array[i] += this.speed;
    }

    progressAttr.needsUpdate = true;
  }

  _checkProgress() {
    if (
      this.progress >= 1.1 + this.delaySpread &&
      !this.loopParticles &&
      !this.destroyed
    ) {
      log(`moving particles is complete, destroying`);
      this.destroy();
      this.completedCallbacks.forEach(cb => cb(this));
    }
  }

  onComplete(cb) {
    log(`installing onComplete handler`);
    console.log("onComplete handler:", cb);
    this.completedCallbacks.push(cb);
  }

  _initRaycasting() {
    this._initRaycastPlane();
    this._initRaycaster();
  }

  _initRaycastPlane() {
    let geometry = new THREE.PlaneBufferGeometry(7500, 7500, 1, 1);
    let material = new THREE.MeshBasicMaterial();
    material.transparent = true;
    material.opacity = 0;
    let plane = new THREE.Mesh(geometry, material);
    this.raycastPlane = plane;
    this.stage.scene.add(plane);
  }

  _initRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  _raycast(x, y) {
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.stage.camera);
    const result = [];
    const intersection = this.raycaster.intersectObject(this.raycastPlane)[0]; // intersecting a plane, so there can be only one result

    if (intersection) {
      result.push(intersection.point.x);
      result.push(intersection.point.y);
    }

    return result;
  }

  _raycastPaths() {
    // raycast the coords to screenspace and then copy them into the paths uniform
    const transformedCoords = this._transformCoordinates(
      this.material.uniforms.paths.value
    );
    this.material.uniforms.paths.value.forEach(
      (v, i, c) => (c[i] = transformedCoords[i])
    );

    // set the minimum and maximum X values
    const xValues = filter(
      this.material.uniforms.paths.value,
      (v, i) => i % 2 === 0
    );

    this.material.uniforms.xStart.value = min(xValues) + 3;
    this.material.uniforms.xEnd.value = max(xValues) - 16;
  }

  _initParticles(addToScene = true) {
    this.moveDelay = this._getMoveDelayAttribute();
    this.material = this._getMaterial();
    this.geometry = this._getGeometry(this.material, this.moveDelay);
    this.points = this._getPoints(this.geometry, this.material);

    if (addToScene) {
      this.stage.scene.add(this.points);
    }
  }

  _getGeometry(material, delay) {
    const geometry = new THREE.BufferGeometry();

    const positions = this._getPositionAttribute();

    // save a copy of the initial positions
    this.initialPositions = positions.clone().array;

    geometry.addAttribute("position", positions);
    geometry.addAttribute("moveDelay", this.moveDelay);
    geometry.addAttribute("variation", this._getVariationAttribute());
    geometry.addAttribute("progress", this._getProgressAttribute(delay));
    geometry.addAttribute(
      "path",
      this._getPathAttribute(material.uniforms.paths.value.length)
    );
    geometry.addAttribute("color", this._getColorAttribute(positions));

    return geometry;
  }

  _getPoints(geometry, material) {
    const points = new THREE.Points(geometry, material);
    return points;
  }

  _getMaterial() {
    const shaders = ShaderLoader.load();

    const fragmentShader = shaders.frag;
    const vertexShader = shaders.vert
      .replace("${PATH_NODES}", this.paths.nodes)
      .replace("${PATH_COMPONENTS}", this.paths.components)
      .replace("${PATH_SPREAD}", this.spread.toPrecision(8))
      .replace("${PATH_COUNT}", this.paths.count);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        size: { type: "t", value: this.size },
        opacity: { type: "f", value: 1.0 },
        xStart: { type: "f", value: 1.0 },
        xEnd: { type: "f", value: 1.0 },
        loopParticles: { type: "f", value: +this.loopParticles },
        texture: {
          value: new THREE.TextureLoader().load(
            document.querySelector("#particle-sprite").src
          )
        },
        paths: this._getPathsUniform()
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader,
      fragmentShader
    });

    return material;
  }

  _getPositionAttribute() {
    const array = new Float32Array(this.pointCount * 3);

    for (let i = 0; i < this.pointCount; i++) {
      const x = i % 200;
      const y = Math.floor(i / 200);
      const z = 0;

      array[i * 3 + 0] = x;
      array[i * 3 + 1] = y;
      array[i * 3 + 2] = z;
    }

    return new THREE.Float32BufferAttribute(array, 3);
  }

  _transformCoordinates(coordinates) {
    const width = this.stage.renderer.domElement.clientWidth;
    const height = this.stage.renderer.domElement.clientHeight;

    const newCoordinates = [];

    for (let i = 0; i < coordinates.length; i += 2) {
      const x = coordinates[i] / width * 2 - 1;
      const y = -coordinates[i + 1] / height * 2 + 1;
      const newCoord = this._raycast(x, y);
      // const newCoord = [x, y];
      newCoordinates.push(newCoord[0]);
      newCoordinates.push(newCoord[1]);
      // newCoordinates.push(coordinates[i]);
      // newCoordinates.push(coordinates[i + 1]);
    }

    return newCoordinates;
  }

  _getPathsUniform() {
    return new THREE.Uniform(this.paths.coordinates);
  }

  _getProgressAttribute(delay) {
    const array = delay.array.slice();
    return new THREE.Float32BufferAttribute(array, 1);
  }

  _getPathAttribute(pathCount) {
    const array = new Float32Array(this.pointCount);
    for (let i = 0; i < this.pointCount; i++) {
      array[i] = this._pickPath(Math.random());
    }
    return new THREE.Float32BufferAttribute(array, 1);
  }

  /**
   * Choose a path using the given probability distribution.
   */
  _pickPath(x = 0) {
    const probabilitySums = this.probability.slice();

    // add up the probabilities sequentially, so the final number in the array is 1.0

    probabilitySums.forEach((p, i, c) => (c[i] = c[i] + (c[i - 1] || 0)));

    const path = probabilitySums.findIndex(p => x <= p);

    return path;
  }

  _getMoveDelayAttribute() {
    const array = new Float32Array(this.pointCount);

    for (let i = 0; i < this.pointCount; i++) {
      array[i] = -this.delaySpread * Math.random() - 0.1;
    }

    return new THREE.Float32BufferAttribute(array, 1);
  }

  _getVariationAttribute() {
    const array = new Float32Array(this.pointCount);

    for (let i = 0; i < this.pointCount; i++) {
      array[i] = Math.random();
    }

    return new THREE.Float32BufferAttribute(array, 1);
  }

  /* colors are based on positions, currently, but not forever */
  _getColorAttribute(positions) {
    const array = new Float32Array(this.pointCount * 3);
    const color = new THREE.Color();
    let vertex;

    for (let i = 0; i < this.pointCount; ++i) {
      const i3 = i * 3;
      /* white */
      // array[i3 + 0] = 255 / 255;
      // array[i3 + 1] = 255 / 255;
      // array[i3 + 2] = 255 / 255;

      /* random */
      array[i3 + 0] = this.color.r;
      array[i3 + 1] = this.color.g;
      array[i3 + 2] = this.color.b;

      /* yellow */
      // array[i3 + 0] = 246 / 255;
      // array[i3 + 1] = 203 / 255;
      // array[i3 + 2] = 105 / 255;
    }

    return new THREE.Float32BufferAttribute(array, 3);
  }
}
