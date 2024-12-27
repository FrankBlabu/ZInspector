//import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Box from '@mui/material/Box';


import './assets/Inspection.scss';


function Inspection() {
    return (
        <Box className="canvas-container">
            <Canvas>
                <OrbitControls />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </Canvas>
        </Box>
    );
};

export default Inspection;