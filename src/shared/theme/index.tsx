import { ThemeProvider } from '@mui/material';
import React from 'react';
import { useMode } from '../../hooks/mode';
import { theme } from './Theme';

const JavafyTheme: React.FC = ({ children }) => {
  const { mode } = useMode();

  return (
    <ThemeProvider theme={theme(mode)}>
      <div className={mode === 'dark' ? 'text-white' : ''}>{children}</div>
    </ThemeProvider>
  );
};

export default JavafyTheme;
