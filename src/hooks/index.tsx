import React from 'react';
import { ModeProvider } from './designMode';

const StateProviders: React.FC = ({ children }) => {
  return <ModeProvider>{children}</ModeProvider>;
};

export default StateProviders;
