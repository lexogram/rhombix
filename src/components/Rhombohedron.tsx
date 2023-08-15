import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'


type ShapeProps = {
  color: number
  position: [ number, number, number]
  scale: number
  hovered: boolean
}
type Rotation = {
  x: number
}
type BoxMesh = {
  rotation: Rotation
} | undefined
type BoxRef = any // sledgehammer to keep TypeScript quiet



const Shape = (props:ShapeProps) => {
  const { color, position, scale, hovered } = props

  return (
    <mesh
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      scale={scale}
    >
      <planeGeometry />
      <meshBasicMaterial
        color={hovered ? "#f00" : color}
        side={DoubleSide}
      />
    </mesh>
  )
}



const Rhombohedron = () => {
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
    <group
      ref={ref}
      position={[1,2,-5]}
      onClick={() => setActive(!active)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <Shape
        position={[0,0,0]}
        color={0xff00ff}
        scale={2}
        hovered={hovered}
      />
    </group>
  )
}


export default Rhombohedron
