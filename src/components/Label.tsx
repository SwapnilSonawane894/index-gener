import type { LabelHTMLAttributes } from 'react';
import './Label.css';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export default function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label 
      className={`label ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}