import { ModeProvider } from './mode';

const StateProviders: React.FC = ({ children }) => {
  return <ModeProvider>{children}</ModeProvider>;
};

export default StateProviders;
