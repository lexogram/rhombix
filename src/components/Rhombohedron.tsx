import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Vector3 } from 'three'

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
  shape: string
}
type Rotation = {
  x: number
}
type BoxMesh = {
  rotation: Rotation
} | undefined
type BoxRef = any // sledgehammer to keep TypeScript quiet
type Vertices = Float32Array /*[
  number, number, number,
  number, number, number,
  number, number, number,
  number, number, number,

  number, number, number,
  number, number, number,
  number, number, number,
  number, number, number
]
*/
type Faces = Float32Array // number[]



const PHI = (1 + Math.sqrt(5)) / 2
const THETA = Math.atan(PHI)
const GAMMA = Math.PI / 2 - THETA
const ALPHA = GAMMA * 2
const Y = Math.sin(THETA)
const X = Math.cos(THETA)
const AE = Math.sin(ALPHA)
const BE = Math.cos(ALPHA)

// Acute
const BT = BE / Math.cos(GAMMA)

const ACUTE = {
  H:  Math.sqrt(1 - BT * BT),
  Q: BT / 2
}

const ACUTE_VERTICES = new Float32Array([
  X, ACUTE.Q,   -ACUTE.H/2,
  0, ACUTE.Q+Y, -ACUTE.H/2,
 -X, ACUTE.Q,   -ACUTE.H/2,
  0, ACUTE.Q-Y, -ACUTE.H/2,

  X, -ACUTE.Q,   ACUTE.H/2,
  0, -ACUTE.Q+Y, ACUTE.H/2,
 -X, -ACUTE.Q,   ACUTE.H/2,
  0, -ACUTE.Q-Y, ACUTE.H/2,
]);

// Obtuse
const AT = BE / Y
const OBTUSE = {
  H:  Math.sqrt(1 - AT * AT),
  Q: X - AT / 2
}

const OBTUSE_VERTICES = new Float32Array([
   OBTUSE.Q+X, 0, -OBTUSE.H/2,
   OBTUSE.Q,   Y, -OBTUSE.H/2,
   OBTUSE.Q-X, 0  -OBTUSE.H/2,
   OBTUSE.Q,  -Y, -OBTUSE.H/2,

  -OBTUSE.Q+X, 0, -OBTUSE.H/2,
  -OBTUSE.Q,   Y, -OBTUSE.H/2,
  -OBTUSE.Q-X, 0  -OBTUSE.H/2,
  -OBTUSE.Q,  -Y, -OBTUSE.H/2,
]);

const createFaces = (v:Vertices):Faces => {
  const faceArray = [
    v[2], v[1], v[0],
    v[0], v[3], v[2]
  ]

  const iterable = (function* () {
    yield* faceArray;
  })();

  const float32FromIterable = new Float32Array(iterable);
  return float32FromIterable;
}


// const convertToFloat32Array = (a:Array<number>): Faces => {
//   const iterable = (function* () {
//     yield* a;
//   })();

//   return new Float32Array(iterable);
// }

const Shape = (props:ShapeProps) => {
  const { scale, color, position, shape } = props
  // const vertices:Vertices = shape === "ACUTE"
  //   ? ACUTE_VERTICES
  //   : OBTUSE_VERTICES
  // const faces = createFaces(vertices)
  //              .map(vertex => vertex * scale)
  const faces = new Float32Array([
    -0.8506507873535156,
    0.525731086730957,
    1.051462173461914,
    1.051462173461914,
    0,
    -0.8506507873535156
  ])
  console.log("faces:", faces, faces instanceof Float32Array);


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
        side={DoubleSide}
      />
    </mesh>
  )
}


// const faceData:FaceData = [
//   { position: [ 0,  1, 0 ], color: 0xff0000 },
//   { position: [ 3, -1, 0 ], color: 0xffff00 },
//   { position: [ 3,  1, 0 ], color: 0x00ff00 },
//   { position: [ 0, -1, 0 ], color: 0x00ffff },
//   { position: [-3,  1, 0 ], color: 0x0000ff },
//   { position: [-3, -1, 0 ], color: 0xff00ff }
// ]


const Rhombohedron = () => {
  const ref:BoxRef = useRef()

  const [hovered, hover] = useState(false)
  // const [ clicked, click ] = useState(false)
  const [ active, setActive ] = useState(false)

  // useFrame((_state, delta) => {
  //   const boxMesh:BoxMesh = ref.current

  //   if (boxMesh && boxMesh["rotation"] && active) {
  //     const rotation:Rotation = boxMesh["rotation"]
  //     rotation["x"] += delta
  //   }
  // })

  // @ts-ignore
  // const faces = faceData.map(({ position, color }, ii) => (
  //   <Shape
  //     key={ii}
  //     position={position}
  //     color={color}
  //     scale={2}
  //     hovered={hovered}
  //   />
  // ))

  return (
    <group
      ref={ref}
      position={[1,2,-5]}
      onClick={() => setActive(!active)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <Shape
        scale={2}
        color={0xff0000}
        position={[0,0,0]}
        shape="ACUTE"
        hovered={hovered}
      />
    </group>
  )
}


export default Rhombohedron
