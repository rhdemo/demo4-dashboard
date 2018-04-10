import { chain } from "lodash";
import { makeLogger } from "../logging/Logger.js";
import * as THREE from "three";

const log = makeLogger("Free");

/**
 * Remove a three.js mesh from the scene and free all its memory.
 * @param {THREE.Scene} scene the scene to remove the mesh from
 * @param {THREE.Mesh} mesh the mesh to free
 */
export default function free(scene, mesh) {
  scene.remove(mesh);

  // dispose of the geometry
  if (mesh.geometry) {
    mesh.geometry.dispose();
    log(`disposed of geometry`);
  }

  if (mesh.material) {
    // dispose of any texture uniforms on the material
    chain(mesh.material.uniforms)
      .filter(u => u.value instanceof THREE.Texture)
      .map("value")
      .each(t => {
        t.dispose();
        log(`disposed of material texture`);
      })
      .value();

    // dispose of the material
    mesh.material.dispose();
    log(`disposed of material`);
  }
}
