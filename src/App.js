import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './Pages/Home/Home';
import FichaClinica from './Pages/Home/FichaClinica';
import CambiarContrasena from './components/CambiarContrasena';
import RestablecerContrasena from './components/RestablecerContrasena';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const hasToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
          <Route 
            path="/restablecer-contrasena" 
            element={<RestablecerContrasena />} 
          />
          <Route 
            path="/home/*" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ficha-clinica/:id" 
            element={
              <ProtectedRoute>
                <FichaClinica />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Añadir ToastContainer */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;