uniform sampler2D texture;

varying vec3 vColor;

void main() {
    /* gl_FragColor = vec4( color, 1.0 ); */
    vec4 color = vec4(vColor, 1.0);

    vec2 texCoord = gl_PointCoord.xy; // copy the coordinate within the particle
    texCoord.y = 1.0 - texCoord.y; // flip the y axis so the image is upright

    gl_FragColor = color * texture2D( texture, texCoord );
}
