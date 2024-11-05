import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Home from './Pages/Home/Home';
import FichaClinica from './Pages/Home/FichaClinica';
import CambiarContrasena from './components/CambiarContrasena';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const hasToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  console.log('Token exists:', !!hasToken);
  
  if (!hasToken) {
    console.log('No token found, redirecting to login');
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
      </Router>
    </AuthProvider>
  );
}

export default App;