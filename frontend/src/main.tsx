import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context'
import { BrowserRouter } from 'react-router-dom'
import { UIProvider } from './context/UIContext'
import { ToastProvider } from './components/common/Toast';

// Importar Bootstrap y estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/index.css'

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <UIProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </UIProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
} 