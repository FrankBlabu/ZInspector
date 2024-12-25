import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import './App.css';


function Inspection() {
    return (
        <div className="inspection">
            <Canvas style={{ width: "100%", height: "100%" }}>
                <OrbitControls />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </Canvas>
        </div>
    );
};

export default Inspection;