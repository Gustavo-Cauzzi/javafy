import { createContext, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export type Mode = 'light' | 'dark';

interface ModeContextData {
  mode: Mode;
  setMode: (mode: Mode | ((mode: Mode) => Mode)) => any;
}

const ModeContext = createContext<ModeContextData>({} as ModeContextData);

const darkModeSaved = localStorage.get('@javafy:darkMode'); // 0 ou 1
const didUserSetDarkMode = darkModeSaved ? Boolean(JSON.parse(darkModeSaved)) : false;

const ModeProvider: React.FC = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<Mode>(didUserSetDarkMode ? 'dark' : 'light');

  useEffect(() => {
    if (didUserSetDarkMode) return;

    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  useEffect(() => {
    localStorage.setItem('@javafy:darkMode', JSON.parse(String(Number(mode === 'dark')))); // 0 ou 1
  }, [mode]);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
};

function useMode(): ModeContextData {
  const context = useContext(ModeContext);

  return context;
}

export { ModeProvider, useMode };
