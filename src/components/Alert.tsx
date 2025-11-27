import { CheckCircle, XCircle } from 'lucide-react';
import './Alert.css';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

export default function Alert({ message, type, onClose }: AlertProps) {
  return (
    <div className={`alert ${type}`}>
      {type === 'success' ? (
        <CheckCircle className="alert-icon" />
      ) : (
        <XCircle className="alert-icon" />
      )}
      <span className="alert-message">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="alert-close"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}