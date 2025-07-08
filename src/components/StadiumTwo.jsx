"use client";

import React, { useEffect, useMemo } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as THREE from 'three'

export default function StadiumTwo({ 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [0.1, 0.1, 0.1],
  customMaterial = null, // ✅ shaderMaterial ref from ScreenTransition
}) {
  // Load Draco-compressed GLB using GLTFLoader with DRACOLoader
  const gltf = useLoader(GLTFLoader, '/models/vallourec_stadium_draco.glb', (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/') // assumes draco files are in public/draco/
    loader.setDRACOLoader(dracoLoader)
  })

  console.log(gltf)

  const meshes = useMemo(() => {
    const found = []
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        found.push(child)
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
    console.log("draco meshes:", found);
    return found
  }, [gltf])
  // console.log("meshes:", meshes)

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf]);


  // const { scene: modernStadiumScene } = useGLTF("/models/dji_mini_2_draco.glb");

  // useEffect(() => {
  //   modernStadiumScene.traverse((child) => {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });
  // }, [modernStadiumScene]);

  return (
    <>
      {/* <OrbitControls /> */}
      <ambientLight intensity={0.05} />

      <directionalLight
        position={[10, 30, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* <hemisphereLight
        skyColor="#000000"
        groundColor="#000000"
        intensity={0.9}
      /> */}

      <group position={position} rotation={rotation} scale={scale}>
        {meshes.map((mesh, i) => (
          <group key={i}>
            {/* NO PILLARS */}
            <mesh
              key={i}
              geometry={mesh.geometry}
              position={mesh.position}
              rotation={mesh.rotation}
              scale={mesh.scale}
            >
              <meshStandardMaterial
                // wireframe={true}
                color="black"
                metalness={0.1}
                roughness={0.1}
                envMapIntensity={1}
                // transparent
              />
            </mesh>

            {/* SHOWS PILLARS */}
            {/* <primitive 
              object={gltf.scene} 
              // rotation-y={Math.PI / 2} 
              position={[0, 0, -20]}
              rotation={[0.2, 0, 0]}
            /> */}

            {/* Outline */}
            {/* <lineSegments
              geometry={new THREE.EdgesGeometry(mesh.geometry)}
              position={mesh.position}
              rotation={mesh.rotation}
              scale={mesh.scale}
            >
              <lineBasicMaterial color="#4b6a7d" linewidth={1} />
            </lineSegments> */}
          </group>
        ))}
      </group>


      {/* NON DRACO COMPRESSED */}
      {/* <group position={position} scale={scale}>
        <primitive 
          object={modernStadiumScene} 
          // rotation-y={Math.PI / 2} 
          position={[0, -0.5, 13]}
          rotation={[0.2, 0, 0]}
        />
      </group> */}
    </>
  )
}
