import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const StarField = (props: any) => {
  const ref = useRef<any>();
  const viewport = useThree((state) => state.viewport);
  
  const count = 3000;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const radius = 2; // Radius of the sphere
    
    for (let i = 0; i < count; i++) {
        // Uniformly distributed points in a sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random()) * radius;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
    }
    return [pos];
  }, []);

  useFrame((state) => {
    if (ref.current) {
        // Rotation
        ref.current.rotation.x -= 0.001;
        ref.current.rotation.y -= 0.0015;

        // Simple subtle parallax based on mouse
        ref.current.rotation.x += (state.pointer.y * 0.05 - ref.current.rotation.x) * 0.05;
        ref.current.rotation.y += (state.pointer.x * 0.05 - ref.current.rotation.y) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={props.color || "#6366f1"}
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.NormalBlending} // Changed from Additive for better visibility on light bg
        />
      </Points>
    </group>
  );
};

const ThreeBackground = () => {
  const { theme } = useTheme();
  
  // Conditionally set colors based on theme
  const particleColor = theme === 'dark' ? "#6366f1" : "#1e40af"; // Indigo-500 vs Blue-800
  const bgClass = theme === 'dark' 
    ? "bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#050505]" 
    : "bg-gradient-to-br from-slate-50 via-white to-blue-50";

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className={`absolute inset-0 opacity-90 transition-all duration-500 ${bgClass}`} />
      <Canvas camera={{ position: [0, 0, 1] }}>
        <StarField color={particleColor} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
