/*!
 * Layout.tsx - Layouting components
 */

import React from 'react'
import Box from '@mui/material/Box';


interface BoxChildrenProps {
    children: React.ReactNode;
}

export function BoxExpanding({ children, className }: BoxChildrenProps & { className?: string }) {
    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                width: "100%",
                height: "100vh",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {children}
        </Box>
    );
}