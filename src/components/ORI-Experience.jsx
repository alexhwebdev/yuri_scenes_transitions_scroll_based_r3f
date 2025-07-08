import {
  CameraControls,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";

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

  const { scene: modernKitchenScene, materials } = useGLTF(
    "/models/modern_kitchen.glb"
  );

  useEffect(() => {
    if (mode === prevMode) {
      return;
    }
    renderMaterial.current.progression = 0;
  }, [mode]);

  useFrame(({ gl, scene }, delta) => {
    renderMaterial.current.progression = MathUtils.lerp(
      renderMaterial.current.progression,
      progressionTarget,
      delta * transitionSpeed
    );

    // --------------- firstScene
    firstScene.current.visible = true;
    gl.setRenderTarget(renderTarget1);
    gl.render(scene, renderCamera.current);


    // --------------- secondScene
    secondScene.current.visible = true;
    firstScene.current.visible = false; // Hide first scene to avoid rendering it again
    gl.setRenderTarget(renderTarget2);
    gl.render(scene, renderCamera.current);
    secondScene.current.visible = false; // Hide second scene to avoid rendering it again

    gl.setRenderTarget(null); // Reset render target to default so we can see the result in the canvas.
    renderMaterial.current.map = renderTarget1.texture;
  });

  const renderCamera = useRef();
  const controls = useRef();

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      2.0146122041349432,
      2.822796205893349,
      10.587088991637922,
      1.0858141754116573,
      1.9366397611967157,
      1.7546919697281576
    );
  }, []);

  const { progressionTarget, transitionSpeed } = useControls({
    transitionSpeed: {
      value: 2,
      min: 0.3,
      max: 10,
    },
    progressionTarget: {
      value: 1,
    },
    mode: {
      value: mode,
      options: [...Array(nbModes).keys()],
      onChange: (value) => {
        setMode((mode) => {
          setPrevMode(mode);
          return value;
        });
      },
    },
    transition: {
      value: 0,
      options: {
        Horizontal: 0,
        Vertical: 1,
      },
      onChange: (value) => {
        renderMaterial.current.transition = value;
      },
    },
  });

  useEffect(() => {
    modernKitchenScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [modernKitchenScene]);

  return (
    <>
      <OrbitControls />
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
      />

      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <transitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
        />
      </mesh>
      
      <group ref={firstScene}>
        <primitive object={modernKitchenScene} rotation-y={Math.PI / 2} />
      </group>
      
      <group ref={secondScene}>
        <mesh position-x={1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
      <Environment preset="sunset" blur={0.4} background />
    </>
  );
};

useGLTF.preload("/models/modern_kitchen.glb");
