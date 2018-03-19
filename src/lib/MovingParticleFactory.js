import MovingParticles from "./MovingParticles.js";
import { makeLogger } from "./logging/Logger";

const log = makeLogger("MovingParticleFactory");

export default class MovingParticleFactory {
  static create(stage) {
    log("creating a moving particle object");

    const probability = [0.9, 0.05, 0.05];
    const paths = {
      nodes: 10,
      components: 2,
      count: 3,
      coordinates: [
        211,
        643,
        477,
        643,
        480,
        788,
        641,
        788,
        642,
        998,
        935,
        996,
        931,
        606,
        1030,
        602,
        1029,
        536,
        1228,
        539,
        211,
        643,
        477,
        643,
        480,
        788,
        641,
        788,
        644,
        567,
        807,
        568,
        802,
        756,
        1231,
        758,
        1231,
        758,
        1231,
        758,
        211,
        643,
        477,
        643,
        481,
        326,
        571,
        319,
        572,
        227,
        831,
        231,
        832,
        370,
        978,
        367,
        981,
        276,
        1223,
        278
      ]
    };
    return new MovingParticles(stage, paths, probability);
  }
}
