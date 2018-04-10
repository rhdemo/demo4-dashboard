uniform sampler2D texture;
uniform float opacity;

varying vec3 vColor;
varying float vDiscard;
varying vec2 vPathPos;

void main() {

    if (vDiscard == 1.0) {
        discard;
    }

    float r = 1.0;
    float g = 0.8 + (sin(vPathPos.y/200.0)) / 5.0;
    float b = 0.0;

    /* gl_FragColor = vec4( color, 1.0 ); */
    vec4 color = vec4(r, g, b, opacity);

    vec2 texCoord = gl_PointCoord.xy; // copy the coordinate within the particle
    texCoord.y = 1.0 - texCoord.y; // flip the y axis so the image is upright

    gl_FragColor = color * texture2D( texture, texCoord );
}
