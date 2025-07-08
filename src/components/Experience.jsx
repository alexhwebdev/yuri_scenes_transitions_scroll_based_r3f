import {
  CameraControls,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import ParticlesHoverPlane from "./ParticlesHoverPlane/ParticlesHoverPlane";
// import { StadiumTwo } from "./StadiumTwo";
import StadiumTwo from "./StadiumTwo";

const nbModes = 2;

export const Experience = () => {
  const viewport = useThree((state) => state.viewport);
  const firstScene = useRef();
  const secondScene = useRef();

  const renderTarget1 = useFBO();
  const renderTarget2 = useFBO();
  const renderMaterial = useRef();
  const [mode, setMode] = useState(0);
  const [prevMode, setPrevMode] = useState(0);

  // const { scene: modernKitchenScene } = useGLTF("/models/modern_kitchen.glb");
  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");

  const renderCamera = useRef();
  const controls = useRef();

  const progressionRef = useRef(0); // 0 to 1
  const scrollSpeed = 0.5;

  // Listen to scroll and update progression
  useEffect(() => {
    const handleScroll = (e) => {
      progressionRef.current += e.deltaY * 0.001 * scrollSpeed;
      progressionRef.current = MathUtils.clamp(progressionRef.current, 0, 1);
    };
    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  // useEffect(() => {
  //   // const found = []
  //   modernStadiumScene.traverse((child) => {
  //     if (child.isMesh) {
  //       // found.push(child)
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });
  //   // console.log("none meshes:", found);
  // }, [modernStadiumScene]);

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      2.0146,
      2.8228,
      10.5870,
      1.0858,
      1.9366,
      1.7546
    );
  }, []);

  useFrame(({ gl, scene }, delta) => {
    renderMaterial.current.progression = progressionRef.current;

    // Render first scene
    firstScene.current.visible = true;
    gl.setRenderTarget(renderTarget1);
    gl.render(scene, renderCamera.current);

    // Render second scene
    secondScene.current.visible = true;
    firstScene.current.visible = false;
    gl.setRenderTarget(renderTarget2);
    gl.render(scene, renderCamera.current);
    secondScene.current.visible = false;

    // Show result
    gl.setRenderTarget(null);
    renderMaterial.current.map = renderTarget1.texture;
  });

  return (
    <>
      <PerspectiveCamera near={0.5} ref={renderCamera} />
      <CameraControls
        enablePan={false}
        minPolarAngle={DEG2RAD * 70}
        maxPolarAngle={DEG2RAD * 85}
        minAzimuthAngle={DEG2RAD * -30}
        maxAzimuthAngle={DEG2RAD * 30}
        minDistance={5}
        maxDistance={9}
        ref={controls}

        // Disables zoom on scroll
        dollyToCursor={false}
        enabled={true}
        mouseButtons={{
          left: 1,  // pan
          middle: 0, // disabled
          right: 1,  // rotate
          wheel: 0,  // disable wheel
        }}
        touches={{
          one: 0,
          two: 0
        }}
      />

      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* <transitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        /> */}
        <teleportationMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        />
      </mesh>

      <group ref={firstScene}>
        <Environment preset="sunset" blur={0.4} background />
        {/* <ambientLight intensity={0.3} /> */}
        {/* <directionalLight position={[10, 0, 0]} intensity={0.7} castShadow /> */}
        <primitive 
          object={modernStadiumScene} 
          // rotation-y={Math.PI / 2} 
          position={[0, 0, -20]}
          rotation={[0.2, 0, 0]}
        />
        <ParticlesHoverPlane
          width={50}
          height={50}
          segments={500}
          liftRadius={3}
          liftStrength={1.0}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>

      <group ref={secondScene}>
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
          
          <StadiumTwo 
            scale={2} 
            // envMapIntensity={0.3} 
            position={[0, 0, -50]}
            rotation={[0.3, 0, 0]}
          />
        </mesh>
      </group>
    </>
  );
};

// useGLTF.preload("/models/modern_kitchen.glb");
useGLTF.preload("/models/vallourec_stadium_draco.glb");

