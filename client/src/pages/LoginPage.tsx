import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { user, signIn, signUp, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'ngo'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error.message);
        navigate('/');
      } else {
        const roleValue = role === 'ngo' ? 'ngo' : 'supporter';
        const { error } = await signUp(email, password, { username, role: roleValue });
        if (error) throw new Error(error.message);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">GOODWORK</h1>
        <p className="auth-subtitle">GOODWORK is the place where people meet NGO's</p>

        {error && <div className="error-message">{error}</div>}

        {!isLogin && (
          <div className="role-toggle">
            <button 
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
              type="button"
            >
              register as user
            </button>
            <button 
              className={`role-btn ${role === 'ngo' ? 'active' : ''}`}
              onClick={() => setRole('ngo')}
              type="button"
            >
              register as NGO
            </button>
          </div>
        )}

        <form className="auth-form">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="USERNAME" 
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input 
            type="email" 
            placeholder="EMAIL" 
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-actions">
            <button 
              type="button" 
              className={`action-btn ${isLogin ? 'primary' : 'secondary'}`}
              onClick={(e) => {
                if (isLogin) handleAuth(e, 'login');
                else setIsLogin(true);
              }}
              disabled={loading}
            >
              Sign in
            </button>
            <button 
              type="button" 
              className={`action-btn ${!isLogin ? 'primary' : 'secondary'}`}
              onClick={(e) => {
                if (!isLogin) handleAuth(e, 'register');
                else setIsLogin(false);
              }}
              disabled={loading}
            >
              Sign up
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--color-text-muted)' }}>
            or
          </div>

          <button 
            type="button" 
            className="action-btn secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onClick={async () => {
              setLoading(true);
              try {
                // @ts-ignore
                await signInWithProvider('google');
              } catch (err: any) {
                setError(err.message);
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
