import * as React from 'react';

interface Props {
    size: string;
    shadow?: string;
    color: string;
    bgcolor: string;
    children?: React.ReactNode;
    height: string;
    onClick: (event) => void;
    radius: string;
    width: string;
    border: string;
    padding?: string;
    margin?: string;
    // textAlign?: string;
}


const Button: React.FC<Props> = ({ 
        color,
        bgcolor,
        children,
        onClick,
        radius,
        size,
        shadow,
        height,
        width,
        border,
        padding,
        margin,
        // textAlign
    }) => { 
        return (
            <button 
                onClick={onClick}
                style={{
                backgroundColor: bgcolor,
                color: color,
                borderRadius: radius,
                fontSize: size,
                border: border,
                boxShadow: shadow,
                height,
                width,
                padding: padding,
                margin: margin,
                // textAlign: textAlign
                }}
            >
            {children}
            </button>
        );
    }

export default Button;