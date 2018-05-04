// PATH_NODES is how many nodes there are in each particle's path
#define PATH_NODES ${PATH_NODES}

// two components to each path node, x and y
#define PATH_COMPONENTS ${PATH_COMPONENTS}

// how many paths there are (can't pass this in dynamically; array indices must be static)
#define PATH_COUNT ${PATH_COUNT}

// how many floats are in a single path
#define PATH_LENGTH (PATH_NODES*PATH_COMPONENTS)

// how much to spread out the particles
#define SPREAD ${PATH_SPREAD}

#define DISCARD_THIS -1234567890.0

#define X_START 500.0
#define X_END 2190.0

attribute vec3 color;
attribute float progress;
attribute float path;
attribute float moveDelay;
attribute float variation;

uniform float size;
uniform float paths[PATH_NODES * PATH_COMPONENTS * PATH_COUNT];
uniform float loopParticles;
uniform float xStart;
uniform float xEnd;

varying vec3 vColor;
varying float vDiscard;
varying float vOpacity;
varying float vVariation;

void main() {
    vColor = color;
    vVariation = variation;

    // if loopParticles is enabled, then mod the progress, causing the
    // particles to restart their paths upon completion
    float p = progress;

    /* float xProgress = (position.x - X_START) / (X_END - X_START); */
    /* vOpacity = 1.0 - pow(2.0 * xProgress - 1.0, 8.0); */
    vOpacity = 1.0;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
}
