import { shaderMaterial } from "@react-three/drei";

export const TeleportationMaterial = shaderMaterial(
  {
    progression: 1,
    tex1: undefined,
    tex2: undefined,

  },
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  /*glsl*/ ` 
    varying vec2 vUv;
    uniform float progression;
    uniform sampler2D tex1;
    uniform sampler2D tex2;

    vec2 distort(vec2 olduv, float pr, float expo) {
      vec2 p0 = 2.0 * olduv - 1.0;
      vec2 p1 = p0 / (1.0 - pr * length(p0) * expo);
      return (p1 + 1.0) * 0.5;
    }

    void main() {
      float progress1 = smoothstep(0.75, 1.0, progression);
      vec2 uv1 = distort(vUv, -10.0 * pow(0.5 + 0.5 * progression, 32.0), progression * 4.0);
      vec2 uv2 = distort(vUv, -10.0 * (1.0 - progress1), progression * 4.0);
      vec4 s360 = texture2D(tex1, uv2);
      vec4 sAlt = texture2D(tex2, uv1);
      gl_FragColor = mix(sAlt, s360, progress1);
    }
  `
);
