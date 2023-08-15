import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

/*
1. A golden rhombus is a squished square. It has four equal sides.
The ratio of the lengths of its diagonals is 𝜑, the "golden
number", or (1 + sqrt(5)) / 2.

* ASCII art is not designed for accuracy, so the diagrams here *
* are only approximate, and they may look ugly on your screen. *

                            B
                           /|\
                          /𝛾|𝛾\
                        /   |   \
                    E —+    Y    \
                     /    ° .—T    \
                    /       |  ° .  \
                 C < 𝜷 —————|———X———°> A
                    \       | Q   𝜃 /
                     \      |      /
                       \    |    /
                        \   |   /
                          \ 𝜶 /
                           \|/
                            D
                Figure 1: a golden rhombus

The point Q represents the centre on the plane on which the
rhombus is drawn. The line AE meets the line BC at right angles.
T is the point where AE meets the long diagonal BD.

tan(𝜃) = 𝜑 = Y / X
𝛾 = 90° - 𝜃
𝜶 = 2𝛾

For a golden rhombus with side 1:

X = cos(𝜃)
Y = sin(𝜃)

AE = sin(𝜶)
BE = cos(𝜶)

A golden rhombohedron is a squished cube, where all six faces are
golden rhombuses. There are two ways to fit these six golden
rhombuses together.

2. A slightly squished cube gives an "acute" golden rhombohedron:
                            B
                            .
                           /|\
                          /𝛾| \ side = 1
                        /   Y   \
                     E-+    |    \
                     /    ° ._T    \
                    /      /:\ ° .  \
                 C <——————/—Q—\——X——°> A
                   |.   /   :   \   .|
                   | . /    :_O  \ . |
                   | / .    :    . \ |
                   |/   .   :  .    \|
                 U °      . : .      °
                    \      .:.      /  S
                     \      ° D    /
                       \    .    /
                        \   .   /
                          \ . /
                           \./
                            °
                            V
          Figure 2: an acute golden rhombohedron

The face TBCU is equivalent to the rhombus ABCD rotated around the
axis BC until A is directly above T, at a height of H (not shown).

Since cos(𝛾) = BE / BT:
BT = cos(𝜶) / cos(𝛾)

QT = Y - BT

H = √(1 - BT.BT)

O is the centre of the rhombohedron. If O', U' and S' are O, U and
S projected onto the same plane as Q (i.e. ABCD), then:

CU' = AS' = BT
and
O'Q = BT / 2

3. An almost flattened cube gives an "obtuse" golden rhombohedron.
For convenience, this has been drawn with the X axis vertical and
the Y axis pointing to the left. Please rotate your screen.

                            .A
                        . ° | ° .
                  F . °   𝜃 |     ° .
                . °         X         ° .
            . °     °       |Q           𝛾° .
         B < 𝜶 — — Y— .— — —+— — — — — — — — > D
          |   .         .   |             .   |
          |       .       . |         .       |
          |           .     !_T   .           |
          |             . ° O ° .             |
          |         . °     °     ° .         |
          |     . °         C         ° .     |
          | . °                           ° . |
        U <                                   > S
            ° .                           . °
                ° .                   . °
                    ° .           . °
                        ° .   . °
                            °
                            V
          Figure 3: an obtuse golden rhombohedron

The face ABUT can be created by translating ABCD along the edge
DA, so that DC coincides with AB. It is then rotated around the
axis AB until the translated point A is at T', vertically above the
short diagonal, at a height of H (not shown). Let T be the
projection of T' onto the face ABCD, as before.

Using the same logic for TABU as for ABCD above AF = BE = cos(𝜶)

Since cos(𝜃) = AF / AT:
AT = cos(𝜶) / cos(𝜃)

QT = AT - X

H =√(1 - AT.AT)

O is the centre of the rhombohedron. If O', U' and S' are O, U and
S projected onto the same plane as Q (i.e. ABCD), then:

BU' = DS' = AT
and
O'Q = (X - AT) / 2
*/


type Position = Vector3 | [number, number, number]
type ShapeProps = {
  colors: number[]
  position: Position
  scale: number
  hovered: boolean
  shape: string
}
type Rotation = {
  x: number
}
type BoxMesh = {
  rotation: Rotation
} | undefined
type BoxRef = any // sledgehammer to keep TypeScript quiet
type Vertex = [number, number, number]
type Vertices = [
  Vertex, Vertex, Vertex, Vertex,
  Vertex, Vertex, Vertex, Vertex
]
type Faces = Float32Array[]



const PHI = (1 + Math.sqrt(5)) / 2
const THETA = Math.atan(PHI)
const GAMMA = Math.PI / 2 - THETA
const ALPHA = GAMMA * 2
const Y = Math.sin(THETA)
const X = Math.cos(THETA)
// const AE = Math.sin(ALPHA)
const BE = Math.cos(ALPHA)

// Acute
const BT = BE / Math.cos(GAMMA)

const ACUTE = {
  H:  Math.sqrt(1 - BT * BT),
  Q: BT / 2
}

const ACUTE_VERTICES:Vertices = [
  [ X, ACUTE.Q,   -ACUTE.H/2], // A: 0
  [ 0, ACUTE.Q+Y, -ACUTE.H/2], // B: 1
  [-X, ACUTE.Q,   -ACUTE.H/2], // C: 2
  [ 0, ACUTE.Q-Y, -ACUTE.H/2], // D: 3

  [ X, -ACUTE.Q,   ACUTE.H/2], // S: 4
  [ 0, -ACUTE.Q+Y, ACUTE.H/2], // T: 5
  [-X, -ACUTE.Q,   ACUTE.H/2], // U: 6
  [ 0, -ACUTE.Q-Y, ACUTE.H/2], // V: 7
]

// Obtuse
const AT = BE / Y
const OBTUSE = {
  H:  Math.sqrt(1 - AT * AT),
  Q: X - AT / 2
}

const OBTUSE_VERTICES:Vertices = [
  [ OBTUSE.Q+X, 0, -OBTUSE.H/2], // A: 0
  [ OBTUSE.Q,   Y, -OBTUSE.H/2], // B: 1
  [ OBTUSE.Q-X, 0, -OBTUSE.H/2], // C: 2
  [ OBTUSE.Q,  -Y, -OBTUSE.H/2], // D: 3

  [-OBTUSE.Q+X, 0,  OBTUSE.H/2], // T: 4
  [-OBTUSE.Q,   Y,  OBTUSE.H/2], // U: 5
  [-OBTUSE.Q-X, 0,  OBTUSE.H/2], // V: 6
  [-OBTUSE.Q,  -Y,  OBTUSE.H/2]  // S: 7
]

const createFaces = (shape:string):Faces => {
  const isAcute = shape === "ACUTE"
  const v:Vertices = isAcute
    ? ACUTE_VERTICES
    : OBTUSE_VERTICES

  const faceArray = isAcute
    ? [
        [...v[1], ...v[0], ...v[2],  // face 1.1 BAC righthand rule 
         ...v[3], ...v[2], ...v[0]], // face 1.2 DCA
        [...v[1], ...v[2], ...v[5],  // face 2.1 BCT
         ...v[6], ...v[5], ...v[2]], // face 2.2 UTC
        [...v[1], ...v[5], ...v[0],  // face 3   BTA
         ...v[4], ...v[0], ...v[5]], //          SAT
        [...v[7], ...v[3], ...v[4],  // face 4   VDS
         ...v[0], ...v[4], ...v[3]], //          ASD
        [...v[7], ...v[6], ...v[3],  // face 5   VUD
         ...v[2], ...v[3], ...v[6]], //          CDU
        [...v[7], ...v[4], ...v[6],  // face 6   VSU
         ...v[5], ...v[6], ...v[4]]  //          TUS
      ]
    : [
      [...v[2], ...v[1], ...v[0],  // face 1.1 CBA righthand rule 
       ...v[2], ...v[0], ...v[3]], // face 1.2 CAD
      [...v[2], ...v[5], ...v[1],  // face 2.1 CUB
       ...v[2], ...v[6], ...v[5]], // face 2.2 CVU
      [...v[3], ...v[7], ...v[2],  // face 3   CDS
       ...v[6], ...v[2], ...v[7]], //          VCS
      [...v[4], ...v[3], ...v[0],  // face 4   TDA
       ...v[4], ...v[7], ...v[3]], //          TSD
      [...v[4], ...v[1], ...v[5],  // face 5   TBU
       ...v[4], ...v[0], ...v[1]], //          TAB
      [...v[4], ...v[5], ...v[6],  // face 6   TUV
       ...v[4], ...v[6], ...v[7]]  //          TVS
    ]

  return faceArray.map(face => new Float32Array(face));
}


type FaceProps = {
  position:Position
  faces:Float32Array
  color:number
}
const Face = (props:FaceProps) => {
  const { position, faces, color } = props
  return (
    <mesh
      position={position}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={faces}
          itemSize={3}
          count={6}
        />
      </bufferGeometry>
      <meshStandardMaterial
        attach="material"
        color={color}
        flatShading={true}
      />
    </mesh>
  )
}


const Shape = (props:ShapeProps) => {
  const { scale, colors, position, shape } = props

  const faces = createFaces(shape)
               .map(face => face.map(vertex => vertex * scale))
               .map((faces, ii) => {2
                  return (
                    <Face
                      key={ii}
                      color={colors[ii]}
                      position={position}
                      faces={faces}
                    />
                  )
               })

  return faces
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

  const colors = [
    0xff0000,
    0xffff00,
    0x00ff00,
    0x00ffff,
    0x0000ff,
    0xff00ff,
  ]

  return (
    <group
      ref={ref}
      position={[0,0,-15]}
      onClick={() => setActive(!active)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <Shape
        scale={5}
        colors={colors}
        position={[4, 0, 0]}
        shape="OBTUSE"
        hovered={hovered}
      />
      <Shape
        scale={5}
        colors={colors}
        position={[-4, 0, 0]}
        shape="ACUTE"
        hovered={hovered}
      />
    </group>
  )
}


export default Rhombohedron
