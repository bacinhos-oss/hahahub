import React from 'react';

// Small flags drawn as SVG (emoji flags do not show on Windows).
// Slovenia carries its coat of arms; without it the stripes alone would read as another country's flag.
export const FlagSI: React.FC<{ height?: number }> = ({ height = 14 }) => (
  <svg viewBox="0 0 30 20" height={height} width={height * 1.5} role="img" aria-label="Slovenia" style={{ display: 'inline-block', flexShrink: 0 }}>
    <title>Slovenia</title>
    <rect width="30" height="20" fill="#ED1C24" />
    <rect width="30" height="13.33" fill="#005CE5" />
    <rect width="30" height="6.67" fill="#FFFFFF" />
    <path d="M5.4 3.2 H10.6 V8.2 Q10.6 10.6 8 11.6 Q5.4 10.6 5.4 8.2 Z" fill="#ED1C24" />
    <path d="M5.9 3.6 H10.1 V8.1 Q10.1 10.1 8 11 Q5.9 10.1 5.9 8.1 Z" fill="#005CE5" />
    <path d="M5.9 8.9 L6.9 7.4 L7.5 8.0 L8 6.3 L8.5 8.0 L9.1 7.4 L10.1 8.9 Q10 9.6 9.4 10.1 L6.6 10.1 Q6 9.6 5.9 8.9 Z" fill="#FFFFFF" />
    <defs><clipPath id="hh-si-shield"><path d="M5.9 3.6 H10.1 V8.1 Q10.1 10.1 8 11 Q5.9 10.1 5.9 8.1 Z" /></clipPath></defs>
    <g clipPath="url(#hh-si-shield)">
      <path d="M5.6 9.35 q0.3 -0.35 0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0" stroke="#005CE5" strokeWidth="0.35" fill="none" />
      <path d="M5.6 10.0 q0.3 -0.35 0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0 t0.6 0" stroke="#005CE5" strokeWidth="0.35" fill="none" />
    </g>
    <polygon points="7.25,3.48 7.43,3.79 7.79,3.79 7.61,4.10 7.79,4.41 7.43,4.41 7.25,4.72 7.07,4.41 6.71,4.41 6.89,4.10 6.71,3.79 7.07,3.79" fill="#FFDD00" /><polygon points="8.75,3.48 8.93,3.79 9.29,3.79 9.11,4.10 9.29,4.41 8.93,4.41 8.75,4.72 8.57,4.41 8.21,4.41 8.39,4.10 8.21,3.79 8.57,3.79" fill="#FFDD00" /><polygon points="8.00,4.63 8.18,4.94 8.54,4.94 8.36,5.25 8.54,5.56 8.18,5.56 8.00,5.87 7.82,5.56 7.46,5.56 7.64,5.25 7.46,4.94 7.82,4.94" fill="#FFDD00" />
  </svg>
);

export const FlagEU: React.FC<{ height?: number }> = ({ height = 14 }) => (
  <svg viewBox="0 0 30 20" height={height} width={height * 1.5} role="img" aria-label="European Union" style={{ display: 'inline-block', flexShrink: 0 }}>
    <title>European Union</title>
    <rect width="30" height="20" fill="#003399" />
    <polygon points="21.00,8.90 21.26,9.64 22.05,9.66 21.42,10.14 21.65,10.89 21.00,10.44 20.35,10.89 20.58,10.14 19.95,9.66 20.74,9.64" fill="#FFCC00" /><polygon points="20.20,11.90 20.45,12.64 21.24,12.66 20.61,13.14 20.84,13.89 20.20,13.44 19.55,13.89 19.78,13.14 19.15,12.66 19.94,12.64" fill="#FFCC00" /><polygon points="18.00,14.10 18.26,14.84 19.05,14.86 18.42,15.33 18.65,16.09 18.00,15.64 17.35,16.09 17.58,15.33 16.95,14.86 17.74,14.84" fill="#FFCC00" /><polygon points="15.00,14.90 15.26,15.64 16.05,15.66 15.42,16.14 15.65,16.89 15.00,16.44 14.35,16.89 14.58,16.14 13.95,15.66 14.74,15.64" fill="#FFCC00" /><polygon points="12.00,14.10 12.26,14.84 13.05,14.86 12.42,15.33 12.65,16.09 12.00,15.64 11.35,16.09 11.58,15.33 10.95,14.86 11.74,14.84" fill="#FFCC00" /><polygon points="9.80,11.90 10.06,12.64 10.85,12.66 10.22,13.14 10.45,13.89 9.80,13.44 9.16,13.89 9.39,13.14 8.76,12.66 9.55,12.64" fill="#FFCC00" /><polygon points="9.00,8.90 9.26,9.64 10.05,9.66 9.42,10.14 9.65,10.89 9.00,10.44 8.35,10.89 8.58,10.14 7.95,9.66 8.74,9.64" fill="#FFCC00" /><polygon points="9.80,5.90 10.06,6.64 10.85,6.66 10.22,7.14 10.45,7.89 9.80,7.44 9.16,7.89 9.39,7.14 8.76,6.66 9.55,6.64" fill="#FFCC00" /><polygon points="12.00,3.70 12.26,4.45 13.05,4.46 12.42,4.94 12.65,5.69 12.00,5.24 11.35,5.69 11.58,4.94 10.95,4.46 11.74,4.45" fill="#FFCC00" /><polygon points="15.00,2.90 15.26,3.64 16.05,3.66 15.42,4.14 15.65,4.89 15.00,4.44 14.35,4.89 14.58,4.14 13.95,3.66 14.74,3.64" fill="#FFCC00" /><polygon points="18.00,3.70 18.26,4.45 19.05,4.46 18.42,4.94 18.65,5.69 18.00,5.24 17.35,5.69 17.58,4.94 16.95,4.46 17.74,4.45" fill="#FFCC00" /><polygon points="20.20,5.90 20.45,6.64 21.24,6.66 20.61,7.14 20.84,7.89 20.20,7.44 19.55,7.89 19.78,7.14 19.15,6.66 19.94,6.64" fill="#FFCC00" />
  </svg>
);
