import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import '../styles/Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Invalid credentials. Try principal/principal123 or hod/hod123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <GraduationCap size={28} />
          </div>
          <h2>Success Helper</h2>
        </div>
        
        <div className="welcome-section">
          <h1>Welcome Back</h1>
          <p>Please enter your details to access the Success Helper</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="login-username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-message" data-testid="login-error-message">{error}</div>}

          <button type="submit" className="login-button" data-testid="login-submit-button">
            Sign In
          </button>

          <div className="login-footer">
            <a href="#">Forgot Password?</a>
            <span>|</span>
            <a href="#">Contact Admin</a>
          </div>
        </form>
      </div>
    </div>
  );
}