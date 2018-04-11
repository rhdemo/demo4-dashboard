uniform sampler2D texture;
uniform float opacity;

varying vec3 vColor;
varying float vDiscard;
varying vec2 vPathPos;
varying float vOpacity;
varying float vVariation;

void main() {

    if (vDiscard == 1.0) {
        discard;
    }

    float r = 0.0;
    float g = 0.8 + (sin(vPathPos.y/80.0)) / 5.0;
    float b = 0.7 + (sin(vPathPos.x/80.0)) / 5.0;

    /* gl_FragColor = vec4( color, 1.0 ); */
    /* vec4 color = vec4(r, g, b, vOpacity - vVariation / 4.0); */
    vec4 color = vec4(r, g, b, vOpacity);

    vec2 texCoord = gl_PointCoord.xy; // copy the coordinate within the particle
    texCoord.y = 1.0 - texCoord.y; // flip the y axis so the image is upright

    gl_FragColor = color * texture2D( texture, texCoord );
}
