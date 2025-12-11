import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const AnimatedSphere = () => {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
      <MeshDistortMaterial
        color="#8b5cf6" 
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50 pointer-events-none overflow-hidden">
       {/* Use a separate canvas or overlay if needed, but for hero section styling, 
           we usually want it confined. 
           However, given the previous requirement, let's make it a small animated element 
           that sits BEHIND the text or next to it.
           For now, let's make it fill the container provided to it.
       */}
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default Hero3D;
