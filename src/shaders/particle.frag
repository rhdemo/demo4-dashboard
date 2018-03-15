varying vec3 vColor;

void main() {
    /* gl_FragColor = vec4( color, 1.0 ); */
    gl_FragColor = vec4(vColor, 1.0);
}
