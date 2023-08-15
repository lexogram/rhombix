import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import './App.css'



type Rotation = {
  x: number
}
type BoxMesh = {
  rotation: Rotation
} | undefined
type BoxRef = any // sledgehammer to keep TypeScript quiet



function Box(props:object) {
  const ref:BoxRef = useRef()  

  const [hovered, hover] = useState(false)
  // const [ clicked, click ] = useState(false)
  const [ active, setActive ] = useState(true)

  useFrame((_state, delta) => {
    const boxMesh:BoxMesh = ref.current
    
    if (boxMesh && boxMesh["rotation"] && active) {
      const rotation:Rotation = boxMesh["rotation"]
      rotation["x"] += delta
    }
  })

  return (
    <mesh
      {...props}
      ref={ref}
      // scale={clicked ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry
        args={[1,1,1]}
      />
      <meshStandardMaterial
        color={hovered ? "orange" : "#888"}
      />
    </mesh>
  )
}


function Group() {
  return (
    <group
      position={[1,2,-5]}
    >
      <Box />
    </group>
  )
}


function App() {
  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight
          position={[1,4,9]}
          intensity={256}
          color={"#ff0"}
        />
        <Group />
      </Canvas>
    </>
  )
}

export default App
