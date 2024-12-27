//import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box, Container } from '@mui/material';

import Explorer from './Explorer';

import './assets/Inspection.scss';


function Inspection() {
    return (
        <Container style={{ display: 'flex', height: '100vh' }}>
            <Box className="explorer-container">
                <Explorer />
            </Box>
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
        </Container>
    );
};

export default Inspection;