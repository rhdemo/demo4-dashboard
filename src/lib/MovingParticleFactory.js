import MovingParticles from "./MovingParticles.js";
import { makeLogger } from "./logging/Logger";

const log = makeLogger("MovingParticleFactory");

export default class MovingParticleFactory {
  static create(stage) {
    log("creating a moving particle object");

    const probability = [0.9, 0.05, 0.05];
    const paths = {
      "nodes": 4,
      "components": 2,
      "count": 3,
      "coordinates": [
        322,
        617,
        573,
        743,
        823,
        864,
        1067,
        989,
        322,
        617,
        573,
        743,
        825,
        613,
        1067,
        742,
        322,
        617,
        575,
        494,
        819,
        372,
        1069,
        251
      ]
    };
    return new MovingParticles(stage, paths, probability);
  }
}



