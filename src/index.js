import Stage from "./lib/Stage.js";
import PathTracer from "./lib/PathTracer.js";
import { makeLogger } from "./lib/logging/Logger.js";

const log = makeLogger("index");

log("launching app");
window.stage = new Stage();

log("launching path tracer");
window.tracer = new PathTracer();
