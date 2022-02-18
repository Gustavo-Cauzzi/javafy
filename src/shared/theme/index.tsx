import styled from '@emotion/styled';
import { ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import { useMode, Mode } from '../../hooks/mode';
import { theme } from './Theme';

const scrollBarStyling = (theme: Mode) => `
  ::-webkit-scrollbar-thumb {
    color: ${theme === 'dark' ? '#505050' : '#e6e9d9'};
    border-right: none;
    border-left: none;
    border-radius: 2.5px;
    box-shadow: inset 0 0 0 10px;
  }

  ::-webkit-scrollbar {
    display: block;
    width: 5px;
  }
  ::-webkit-scrollbar-track {
    background:  ${theme === 'dark' ? '#2b2c29' : '#7E8077'};
  }

  ::-webkit-scrollbar-track-piece:end {
  }

  ::-webkit-scrollbar-track-piece:start {
    background: transparent;
  }
`;

const JavafyTheme: React.FC = ({ children }) => {
  const { mode } = useMode();

  useEffect(() => {
    document.body.className = mode === 'dark' ? 'darkScroll' : 'lightScroll';
  }, [mode]);

  return (
    <ThemeProvider theme={theme(mode)}>
      <div
        className={`
          ${mode === 'dark' ? 'text-white' : ''}
        `}
      >
        {children}
      </div>
    </ThemeProvider>
  );
};

export default JavafyTheme;
