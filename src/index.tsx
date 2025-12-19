import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AssetManagerMenu } from './components/AdminColorMenus/Assets/AssetManagerMenu';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AssetManagerMenu />
  </React.StrictMode>
);
