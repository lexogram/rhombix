import { useRef, useState } from 'react'
import { useFrame, extend, BufferGeometryNode } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    customElement: BufferGeometryNode<CustomElement, typeof CustomElement>
  }
}



type ShapeProps = {
  hovered: boolean
  clicked: boolean
}
type Rotation = {
  x: number
}
type BoxMesh = {
  rotation: Rotation
} | undefined
type BoxRef = any // sledgehammer to keep TypeScript quiet



const Shape = (props:ShapeProps) => {
  // const { hovered, clicked } = props

  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[1, 1, 1]}
    >
      <planeBufferGeometry />
      <meshBasicMaterial
        color={0x880000}
      />
    </mesh>
  )
}

extend({ Shape })



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
        hovered={hovered}
        clicked={active}
      />
    </group>
  )
}


export default Rhombohedron
