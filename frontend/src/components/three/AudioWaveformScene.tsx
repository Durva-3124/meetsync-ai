import { Canvas } from "@react-three/fiber"

function WaveformBars() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6D5EF2" />
      </mesh>
    </>
  )
}

export default function AudioWaveformScene() {
  return (
    <div className="w-full h-40 rounded-lg overflow-hidden bg-black/5">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <WaveformBars />
      </Canvas>
    </div>
  )
}