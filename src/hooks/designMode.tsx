import { createContext, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export type Mode = 'light' | 'dark';

interface ModeContextData {
  mode: Mode;
  setMode: (mode: Mode | ((mode: Mode) => Mode)) => any;
}

const ModeContext = createContext<ModeContextData>({} as ModeContextData);

const ModeProvider: React.FC = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<Mode>(prefersDarkMode ? 'dark' : 'light');

  useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
};

function useMode(): ModeContextData {
  const context = useContext(ModeContext);

  return context;
}

export { ModeProvider, useMode };
