import MovingParticles from "./MovingParticles.js";
import { makeLogger } from "./logging/Logger";

const log = makeLogger("MovingParticleFactory");

export default class MovingParticleFactory {
  static create(stage) {
    log("creating a moving particle object");

    const probability = [0.9, 0.05, 0.05];
    const paths = {
      nodes: 4,
      components: 2,
      count: 3,
      coordinates: [
        326,
        586,
        546,
        474,
        767,
        364,
        987,
        254,
        326,
        586,
        546,
        696,
        767,
        585,
        987,
        695,
        326,
        586,
        546,
        696,
        767,
        805,
        988,
        916
      ]
    };
    return new MovingParticles(stage, paths, probability);
  }
}
