import { ThemeProvider } from '@emotion/react';
import { Toaster } from 'react-hot-toast';
import Router from './routes';
import { theme } from './Theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Toaster />
      <Router />
    </ThemeProvider>
  );
};

export default App;
