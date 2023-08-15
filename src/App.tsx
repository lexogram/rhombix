import { Canvas } from '@react-three/fiber'
import './App.css'

import Rhombohedron from './components/Rhombohedron'


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
        <Rhombohedron />
      </Canvas>
    </>
  )
}

export default App
