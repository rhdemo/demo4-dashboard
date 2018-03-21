import { makeLogger } from "../logging/Logger.js";
import { every } from "lodash";
import fs from "fs";

const log = makeLogger("ShaderLoader");

function load() {
  log("loading shaders");
  const vert = fs.readFileSync(
    __dirname + "/../../shaders/particle.vert",
    "utf8"
  ); // parcel enables this
  const frag = fs.readFileSync(
    __dirname + "/../../shaders/particle.frag",
    "utf8"
  ); // parcel enables this
  return { vert, frag };
}

export default { load };
