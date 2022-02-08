import { Toaster } from 'react-hot-toast';
import StateProviders from './hooks';
import Router from './routes';
import JavafyTheme from './shared/theme';

const App: React.FC = () => {
  return (
    <StateProviders>
      <JavafyTheme>
        <Toaster />
        <Router />
      </JavafyTheme>
    </StateProviders>
  );
};

export default App;
