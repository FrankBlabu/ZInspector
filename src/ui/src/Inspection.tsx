//import React from "react";

import { useEffect } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box } from '@mui/material';
import * as THREE from 'three';
import { Box3, Vector3, PerspectiveCamera, OrthographicCamera } from 'three';

import Explorer from './Explorer';
import { BoxExpanding } from './Layout';

import './assets/Inspection.scss';

function fitCameraToObject(
    camera: PerspectiveCamera | OrthographicCamera,
    object: THREE.Object3D,
    offset = 1.25
) {
    // Compute bounding box.
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (camera instanceof PerspectiveCamera) {
        // For perspective camera, adjust position and FOV-based distance.
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = maxDim / (2 * Math.tan(fov / 2));
        cameraZ *= offset; // Add some padding.
        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
    } else if (camera instanceof OrthographicCamera) {
        // For orthographic camera, adjust frustum planes.
        const halfSize = maxDim * 0.5 * offset;
        camera.left = -halfSize;
        camera.right = halfSize;
        camera.top = halfSize;
        camera.bottom = -halfSize;
        camera.position.set(center.x, center.y, center.z + 10); // Slight offset on Z.
        camera.lookAt(center);
    }

    camera.updateProjectionMatrix();
}

function MeshRenderer() {
    const { scene, camera } = useThree();

    useEffect(() => {

        const onMeshChanged = (mesh: Buffer) => {
            const blob = new Blob([mesh], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            new GLTFLoader().load(url, (gltf) => {
                scene.add(gltf.scene);
                fitCameraToObject(camera, gltf.scene);
                URL.revokeObjectURL(url);
            });
        };

        const onAdaptView = () => {
            fitCameraToObject(camera, scene);
        };

        window.renderer.onMeshChanged(onMeshChanged);
        window.renderer.onAdaptView(onAdaptView);

        return () => {
            window.renderer.offMeshChanged(onMeshChanged);
            window.renderer.offAdaptView(onAdaptView);
        };
    }, [scene, camera]);

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