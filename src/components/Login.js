// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Components.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    navigate('/home');
  };

  return (
    <div className="hold-transition login-page" style={{ backgroundImage: 'url(/banner_Fac_Salud-UCM-p3fznpdsj07a1jvjynfznq321kfyi5dthrhd9x5mt4.png)', backgroundSize: 'cover', position: 'relative', height: '100vh' }}>
        <div className="overlay" />
            <div className="login-box">
                <div className="login-logo">
                <p className="brand-link"><img src="/Logo UCM - Horizontal.jpg" alt="Logo UCM" style={{height: 100}}/></p>
                </div>

                <div className="card">
                <div className="card-body login-card-body">
                    <p className="login-box-msg">Iniciar sesión</p>

                    <form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                        <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                        <div className="input-group-append">
                        <div className="input-group-text">
                            <span className="fas fa-envelope" />
                        </div>
                        </div>
                    </div>
                    <div className="input-group mb-3">
                        <input
                        type="password"
                        className="form-control"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                        <div className="input-group-append">
                        <div className="input-group-text">
                            <span className="fas fa-lock" />
                        </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-8">
                        <div className="icheck-primary">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Recuerdame</label>
                        </div>
                        </div>
                        <div className="col-4">
                        <p className="mb-1">
                            <a href="#">Olvidé mi contraseña</a>
                        </p>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Iniciar Sesión</button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;
