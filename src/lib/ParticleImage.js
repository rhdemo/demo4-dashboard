import * as THREE from "three";
import Actor from "./Actor.js";
import { makeLogger } from "./logging/Logger.js";
import Paths from "./Paths.js";

const log = makeLogger("ParticleImage");

export default class ParticleImage extends Actor {
  constructor(stage, imagedata) {
    super(stage);

    this.imagedata = imagedata;

    this.pointCount = this.imagedata.width * this.imagedata.height;

    log("created");

    this._initParticles();

    setTimeout(this._startMove.bind(this), 1000);
  }
  update() {
    if (window.jitter) {
      this._jitterParticles();
    }

    if (this.moving) {
      this._updateMove();
    }
  }

  _startMove() {
    this.moveTimer = 0;
    this.moving = true;
  }

  _updateMove() {
    if (this.moveTimer > 2.0) {
      this.moving = false;
      return;
    }
    const posAttr = this.geometry.attributes.position;
    const pos = this.geometry.attributes.position.array;
    for (let i = 0; i < posAttr.count; ++i) {
      const i3 = i * 3;
      const progress = Math.min(
        1,
        Math.max(0, this.moveTimer - this.moveDelay.array[i])
      );
      const point = this.paths[i].getPoint(progress);
      pos[i3 + 0] = point.x; // + this.initialPositions[i3 + 0] / 10;
      pos[i3 + 1] = point.y; // + this.initialPositions[i3 + 1] / 10;
    }
    this.geometry.attributes.position.needsUpdate = true;

    this.moveTimer += 0.003;
  }

  _jitterParticles() {
    const pos = this.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 0] += (Math.random() - 0.5) / 10;
      pos[i + 1] += (Math.random() - 0.5) / 10;
      pos[i + 2] += (Math.random() - 0.5) / 10;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  _initParticles(addToScene = true) {
    this.geometry = this._getGeometry();
    this.material = this._getMaterial();
    this.points = this._getPoints(this.geometry, this.material);
    this.paths = this._getPaths(this.geometry);
    this.moveDelay = this._getMoveDelayAttribute();

    log("particles initialized");

    if (addToScene) {
      this.stage.scene.add(this.points);
    }
  }

  _getPaths(geometry) {
    const paths = [];
    log("initializing paths");
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const startPoint = new THREE.Vector2(positions[i], positions[i + 1]);
      const path = Paths.get(startPoint);
      paths.push(path);
    }
    return paths;
  }

  _getGeometry() {
    log("creating geometry");
    const geometry = new THREE.BufferGeometry();

    const positions = this._getPositionAttribute();

    // save a copy of the initial positions
    this.initialPositions = positions.clone().array;

    geometry.addAttribute("position", positions);
    geometry.addAttribute("color", this._getColorAttribute(positions));

    return geometry;
  }

  _getPoints(geometry, material) {
    log("creating points");
    const points = new THREE.Points(geometry, material);
    points.position.x -= this.imagedata.width / 2;
    points.position.y -= this.imagedata.height / 2;
    return points;
  }

  _getMaterial() {
    log("creating material");
    return new THREE.PointsMaterial({
      size: 2.0,
      // size: 1.3,
      color: 0xffffff,
      vertexColors: THREE.VertexColors
      // map: new THREE.Texture()
    });
  }

  _getPositionAttribute() {
    log("creating position attribute");
    const array = new Float32Array(this.pointCount * 3);

    for (let i = 0; i < this.pointCount; i++) {
      const x = i % this.imagedata.width;
      const y = Math.floor(i / this.imagedata.width);
      const z = 0;

      array[i * 3 + 0] = x;
      array[i * 3 + 1] = -y + this.imagedata.height; // flip y
      array[i * 3 + 2] = z;
    }

    return new THREE.Float32BufferAttribute(array, 3);
  }

  _getMoveDelayAttribute() {
    log("creating move delay attribute");
    const array = new Float32Array(this.pointCount);

    for (let i = 0; i < this.pointCount; i++) {
      array[i] = Math.random() / 3;
    }

    return new THREE.Float32BufferAttribute(array, 1);
  }

  /* colors are based on positions, currently, but not forever */
  _getColorAttribute(positions) {
    log("creating color attribute");
    const array = new Float32Array(this.pointCount * 3);
    const color = new THREE.Color();
    let vertex;

    for (let i = 0; i < this.pointCount; ++i) {
      const i3 = i * 3;
      const i4 = i * 4;
      array[i3 + 0] = this.imagedata.data[i4 + 0] / 255;
      array[i3 + 1] = this.imagedata.data[i4 + 1] / 255;
      array[i3 + 2] = this.imagedata.data[i4 + 2] / 255;
    }

    return new THREE.Float32BufferAttribute(array, 3);
  }
}
