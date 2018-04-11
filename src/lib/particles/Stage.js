import * as THREE from "three";
// import OrbitControls from "./OrbitControls.js";
import ScoredImageSource from "./ScoredImageSource.js";
import ParticleImageFactory from "./ParticleImageFactory.js";
import MovingParticleFactory from "./MovingParticleFactory.js";
import { makeLogger } from "../logging/Logger.js";

const log = makeLogger("Stage");

export default class Stage {
  constructor({ container = document.body, data = {} } = {}) {
    log("created");
    this.actors = [];
    this.container = container;

    this._init();

    // start the animation loop
    this._render();
  }
  _init() {
    this._initScene();
    this._initRenderer();
    this._initCamera();
    // this._initControls();

    this._initImageSource();
  }
  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
  _initImageSource() {
    this._initScoredImageSource();
  }
  _initScoredImageSource() {
    this.imageSource = new ScoredImageSource();
    this.imageSource.onImage(scoredImage => {
      log(`scored image is on stage!`);
      // const particleImage = ParticleImageFactory.create(
      //   this,
      //   scoredImage.pixels
      // );
      // this._registerActor(particleImage);
      this._initMovingParticles();
    });
  }
  _initMovingParticles() {
    const mp = MovingParticleFactory.create(this);
    this._registerActor(mp);
    mp.onComplete(mp => this._unregisterActor(mp));
  }
  _registerActor(actor) {
    log(`adding actor ${actor.name} to the stage`);
    this.actors.push(actor);
  }
  _unregisterActor(actor) {
    log(`removing actor ${actor.name} from the stage`);
    this.actors.splice(this.actors.indexOf(actor), 1);
    actor.destroy();
  }
  _initCamera() {
    // this._initOrthographicCamera();
    this._initPerspectiveCamera();
  }
  _initPerspectiveCamera() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    log(`res: ${w} x ${h}`);
    this.camera = new THREE.PerspectiveCamera(70, w / h, 1, 3000);
    this.camera.position.z = 100;
  }
  _initOrthographicCamera() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const f = 1000;

    this.camera = new THREE.OrthographicCamera(
      w / -2,
      w / 2,
      h / 2,
      h / -2,
      1,
      f
    );
    this.camera.position.z = 400;
  }
  _initScene() {
    this.scene = new THREE.Scene();
  }
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0, 0);
    this.container.appendChild(this.renderer.domElement);
  }
  _update() {
    this.actors.forEach(actor => actor.update(this));
  }
  _render() {
    requestAnimationFrame(() => this._render());
    this._update();
    this.renderer.render(this.scene, this.camera);
  }
}
