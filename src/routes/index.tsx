import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Main from '../pages/Main';
import MainNl from '../pages/MainNl';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/nl" element={<MainNl />} />
        <Route path="*" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
