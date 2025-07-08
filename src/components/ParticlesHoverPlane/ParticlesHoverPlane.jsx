"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ParticlesHoverPlane = ({
  width = 1,
  height = 1,
  segments = 100,
  liftRadius = 1,
  liftStrength = 0.1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const meshRef = useRef();
  const { size, camera } = useThree();
  const count = segments * segments;

  // Uniform grid (no initial jitter)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const xIndex = i % segments;
      const yIndex = Math.floor(i / segments);
      const x = (xIndex / (segments - 1)) * width - width / 2;
      const y = (yIndex / (segments - 1)) * height - height / 2;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, [count, segments, width, height]);

  const liftMultipliers = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random();
    }
    return arr;
  }, [count]);

  const mousePos = useRef(new THREE.Vector2(10000, 10000));

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      if (meshRef.current) {
        plane.applyMatrix4(meshRef.current.matrixWorld);
      }
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);
      if (intersectPoint && meshRef.current) {
        meshRef.current.worldToLocal(intersectPoint);
        mousePos.current.set(intersectPoint.x, intersectPoint.y);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [camera, size]);

  const uniforms = useMemo(() => ({
    uMousePos: { value: new THREE.Vector2(10000, 10000) },
    uLiftRadius: { value: liftRadius },
    uLiftStrength: { value: liftStrength },
    uEdgeFadeRadius: { value: Math.min(width, height) * 0.4 },
  }), [liftRadius, width, height]);

  useFrame(() => {
    uniforms.uMousePos.value.copy(mousePos.current);
  });

  const vertexShader = /* glsl */`
    attribute float liftMultiplier;

    uniform vec2 uMousePos;
    uniform float uLiftRadius;
    uniform float uLiftStrength;
    uniform float uEdgeFadeRadius;

    varying float vLift;
    varying float vEdgeFade;

    // Simple hash noise
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float dist = distance(position.xy, uMousePos);
      float lift = 0.0;
      vec3 pos = position;

      if (dist < uLiftRadius) {
        float strength = (1.0 - dist / uLiftRadius);
        float noise = rand(position.xy);
        float offsetX = (rand(position.xy + 1.23) - 0.5) * 0.1 * strength;
        float offsetY = (rand(position.xy + 9.87) - 0.5) * 0.1 * strength;

        pos.x += offsetX;
        pos.y += offsetY;
        lift = strength * uLiftStrength * liftMultiplier * noise;
      }

      vLift = lift;

      float r = length(position.xy);
      float fade = smoothstep(uEdgeFadeRadius, uEdgeFadeRadius * 1.3, r);
      vEdgeFade = 1.0 - fade;

      pos.z += lift;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 4.0;
    }
  `;

  const fragmentShader = /* glsl */`
    varying float vLift;
    varying float vEdgeFade;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;

      float opacity = mix(0.1, 1.0, clamp(vLift, 0.0, 1.0));
      opacity *= vEdgeFade;

      if (opacity < 0.01) discard;

      vec3 color = mix(
        vec3(1.0), 
        vec3(1.0, 0.0, 0.0), 
        clamp(vLift, 0.0, 1.0)
      );
      
      gl_FragColor = vec4(color, opacity);
    }
  `;

  return (
    <points ref={meshRef} position={position} rotation={rotation}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-liftMultiplier"
          count={count}
          array={liftMultipliers}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};

export default ParticlesHoverPlane;
