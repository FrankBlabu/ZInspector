//import React from "react";

import { useState, useEffect } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { Box, Container } from '@mui/material';

import Explorer from './Explorer';
import { BoxExpanding } from './Layout';

import './assets/Inspection.scss';

function MeshRenderer() {

    const [callbackRegistered, setCallbackRegistered] = useState(false);
    const { scene } = useThree();

    useEffect(() => {

        let gltf: GLTF | null = null;

        const onMeshChangedFunc = (mesh: Buffer) => {
            console.log('*** Update: ', mesh.length, '***');
            const blob = new Blob([mesh], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            const loader = new GLTFLoader();

            loader.load(url, (loaded_gltf) => {
                console.log('*** GLTF: ', loaded_gltf, '***');
                URL.revokeObjectURL(url);

                gltf = loaded_gltf;
                scene.add(gltf.scene);
            });
        };

        if (!callbackRegistered) {
            window.renderer.onMeshChanged(onMeshChangedFunc);
            setCallbackRegistered(true);
        }

        return () => {
            window.renderer.offMeshChanged(onMeshChangedFunc);
            if (gltf) {
                scene.remove(gltf.scene);
            }
        };

    }, [callbackRegistered]);

    return null;
}

function Inspection() {

    return (
        <Box className="inspection-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
            <Box>
                <Explorer />
            </Box>
            <BoxExpanding className="canvas">
                <Canvas id="canvas" style={{ width: '100%', height: '100%' }}>
                    <OrbitControls />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} />
                    <MeshRenderer />
                </Canvas>
            </BoxExpanding>
        </Box >
    );
};

export default Inspection;