import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Vector3 } from 'three'

type Position = [number, number, number] | Vector3 | undefined
type FaceData = {
  position: Position
  color: number
}[]
type ShapeProps = {
  color: number
  position: Position
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



const PHI = (1 + Math.sqrt(5)) / 2
const THETA = Math.atan(PHI)
const GAMMA = Math.PI / 2 - THETA
const ALPHA = GAMMA * 2
const Y2 = Math.sin(ALPHA)
let dX = Math.cos(ALPHA)

const X2 = 1 + dX
const X = X2 / 2
const Y = Y2 / 2
dX = 1 - X
const Z = 0

const VERTICES = new Float32Array([
   dX, -Y,  Z,
    X,  Y,  Z,
  -dX,  Y,  Z,

  -dX,  Y, Z,
   -X, -Y, Z,
   dX, -Y, Z
]);

const Shape = (props:ShapeProps) => {
  const { scale, color, position } = props
  const vertices = VERTICES.map(vertex => vertex * scale)

  return (
    <mesh
      position={position}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={vertices}
          itemSize={3}
          count={6}
        />
      </bufferGeometry>
      <meshStandardMaterial
        attach="material"
        color={color}
        flatShading={true}
        side={DoubleSide}
      />
    </mesh>
  )
}


const faceData:FaceData = [
  { position: [ 0,  1, 0 ], color: 0xff0000 },
  { position: [ 3, -1, 0 ], color: 0xffff00 },
  { position: [ 3,  1, 0 ], color: 0x00ff00 },
  { position: [ 0, -1, 0 ], color: 0x00ffff },
  { position: [-3,  1, 0 ], color: 0x0000ff },
  { position: [-3, -1, 0 ], color: 0xff00ff }
]


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

  // @ts-ignore
  const faces = faceData.map(({ position, color }, ii) => (
    <Shape
      key={ii}
      position={position}
      color={color}
      scale={2}
      hovered={hovered}
    />
  ))

  return (
    <group
      ref={ref}
      position={[1,2,-5]}
      onClick={() => setActive(!active)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      {faces}
    </group>
  )
}


export default Rhombohedron
