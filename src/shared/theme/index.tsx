import { ThemeProvider } from '@mui/material';
import { useEffect } from 'react';
import { useMode, Mode } from '../../hooks/mode';
import { theme } from './Theme';

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
