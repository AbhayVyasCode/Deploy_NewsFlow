import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const SimpleStars = (props: any) => {
    const ref = useRef<any>(null);

    // Generate random points manually
    const count = 2000;
    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 1.5 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((_state, delta) => {
      if (ref.current) {
        ref.current.rotation.x -= delta / 20;
        ref.current.rotation.y -= delta / 30;
      }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
          <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
            <PointMaterial
              transparent
              color="#aaaaaa"
              size={0.003}
              sizeAttenuation={true}
              depthWrite={false}
              opacity={0.6}
            />
          </Points>
        </group>
    );
};


const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <SimpleStars />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
