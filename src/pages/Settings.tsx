import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Label from '../components/Label';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { adminAPI,authAPI, handleAPIError } from '../services/api';
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
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleResetAllHodConfigs = async () => {
    setResetLoading(true);
    setResetMessage(null);
    try {
      const result = await adminAPI.resetAllHodConfigs();
      setResetMessage({ type: 'success', text: result.message });
    } catch (error) {
      setResetMessage({ type: 'error', text: handleAPIError(error) });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      
      // CALL THE API HERE
      await authAPI.updatePassword(currentPassword, newPassword);
      
      alert("Password updated successfully!");
      
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(handleAPIError(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    
    if (newTheme === 'system') {
      document.documentElement.classList.remove('light', 'dark');
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
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
          
         <Button type="submit" className="update-password-btn" disabled={passwordLoading}>
           {passwordLoading ? 'Updating...' : 'Update Password'}
         </Button>
        </form>
      </div>

      {/* Admin Tools - Only visible to admin users */}
      {user?.role === 'admin' && (
        <div className="settings-section">
          <h2 className="settings-section-title">Admin Tools</h2>
          <div className="admin-tools">
            <div className="admin-tool-item">
              <div className="admin-tool-info">
                <h3 className="admin-tool-title">Reset All HOD Configurations</h3>
                <p className="admin-tool-description">
                  Reset all HOD user configurations to the default semester format. 
                  Use this if HOD users encounter processing errors due to outdated configurations.
                </p>
              </div>
              <Button 
                onClick={handleResetAllHodConfigs} 
                disabled={resetLoading}
                className="admin-tool-btn"
              >
                <RefreshCw size={16} className={resetLoading ? 'spinning' : ''} />
                {resetLoading ? 'Resetting...' : 'Reset All Configs'}
              </Button>
            </div>
            {resetMessage && (
              <div className={`admin-message ${resetMessage.type}`}>
                {resetMessage.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Settings */}
      <div className="settings-section">
        <h2 className="settings-section-title">Theme Preference</h2>
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