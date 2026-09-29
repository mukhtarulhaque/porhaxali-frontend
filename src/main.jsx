import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/context/AuthProvider'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DevelopmentAccessProvider from './components/context/DevelopmentAccessProvider';
import DevelopmentAccessGate from './components/developmentAccess/DevelopmentAccessGate';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevelopmentAccessProvider>
      <DevelopmentAccessGate>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/*" element={<App/>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </DevelopmentAccessGate>
    </DevelopmentAccessProvider>
  </StrictMode>
)

