import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{token: {
      colorPrimary: '1D8B70',
    }}}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
