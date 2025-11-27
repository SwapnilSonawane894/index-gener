import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Label from '../components/Label';
import Alert from '../components/Alert';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Settings.css';

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [passwordAlert, setPasswordAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [themeAlert, setThemeAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordAlert({ message: 'All password fields are required', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordAlert({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    
    // Simulate password update
    setPasswordAlert({ message: 'Password updated successfully', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    
    if (newTheme === 'system') {
      document.documentElement.classList.remove('light', 'dark');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
      setThemeAlert({ message: 'Theme set to system preference', type: 'success' });
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      setThemeAlert({ message: `Theme set to ${newTheme} mode`, type: 'success' });
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      
      {/* User Information */}
      <div className="settings-section">
        <h2 className="settings-section-title">Account Information</h2>
        <div className="account-info">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <p className="info-value">{user?.name}</p>
          </div>
          <div className="info-row">
            <span className="info-label">Role:</span>
            <p className="info-value">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Update Password */}
      <div className="settings-section">
        <h2 className="settings-section-title">Update Password</h2>
        {passwordAlert && (
          <Alert
            message={passwordAlert.message}
            type={passwordAlert.type}
            onClose={() => setPasswordAlert(null)}
          />
        )}
        <form onSubmit={handlePasswordUpdate} className="password-form">
          <div className="form-group">
            <Label htmlFor="currentPassword" className="form-label">Current Password</Label>
            <div className="password-input-wrapper">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="password-input"
              />
              <Button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="password-toggle"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="newPassword" className="form-label">New Password</Label>
            <div className="password-input-wrapper">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="password-input"
              />
              <Button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="password-toggle"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="confirmPassword" className="form-label">Confirm New Password</Label>
            <div className="password-input-wrapper">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="password-input"
              />
              <Button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="update-password-btn">
            Update Password
          </Button>
        </form>
      </div>

      {/* Theme Settings */}
      <div className="settings-section">
        <h2 className="settings-section-title">Theme Preference</h2>
        {themeAlert && (
          <Alert
            message={themeAlert.message}
            type={themeAlert.type}
            onClose={() => setThemeAlert(null)}
          />
        )}
        <div className="theme-options">
          <Button
            onClick={() => handleThemeChange('system')}
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
          >
            <div className="theme-option-title">System</div>
            <div className="theme-option-description">
              Follow system theme preference
            </div>
          </Button>
          
          <Button
            onClick={() => handleThemeChange('light')}
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          >
            <div className="theme-option-title">Light</div>
            <div className="theme-option-description">
              Always use light theme
            </div>
          </Button>
          
          <Button
            onClick={() => handleThemeChange('dark')}
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          >
            <div className="theme-option-title">Dark</div>
            <div className="theme-option-description">
              Always use dark theme
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}