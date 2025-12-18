import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, BarChart3 } from 'lucide-react';
import { apiTool, downloadFile, handleAPIError } from '../services/api';
import '../styles/SuccessIndex.css'; // Reusing styles

export default function API() {
  const [yearType, setYearType] = useState('TY');
  const [yearLabel, setYearLabel] = useState('2024-25');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!file) {
      setError("Please upload a result file");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Define sem names based on selection
      let s1 = "Sem I", s2 = "Sem II";
      if (yearType === 'SY') { s1 = "Sem III"; s2 = "Sem IV"; }
      if (yearType === 'TY') { s1 = "Sem V"; s2 = "Sem VI"; }

      const blob = await apiTool.generateReport(file, yearType, yearLabel, s1, s2);
      downloadFile(blob, `API_${yearType}.xlsx`);
      setSuccess("API Report generated successfully!");
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="success-index-container">
      <div className="success-index-header">
        <h2 className="page-subtitle">Academic Performance Index (API)</h2>
        <p className="page-description">Generate API calculation reports for accreditation.</p>
      </div>

      {error && <div className="message-box error-message">{error}</div>}
      {success && <div className="message-box success-message"><CheckCircle size={18}/>{success}</div>}

      <div className="batch-config-section">
        <h3 className="section-title">Configuration</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select 
              className="form-input" 
              value={yearType} 
              onChange={(e) => setYearType(e.target.value)}
            >
              <option value="FY">First Year (FY)</option>
              <option value="SY">Second Year (SY)</option>
              <option value="TY">Third Year (TY)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Year Label</label>
            <input 
              type="text" 
              className="form-input" 
              value={yearLabel} 
              onChange={(e) => setYearLabel(e.target.value)} 
              placeholder="e.g. 2024-25"
            />
          </div>
        </div>
      </div>

      <div className="file-upload-section">
        <h3 className="section-title">Upload Result Data</h3>
        <div className="file-upload-row">
          <div className="file-upload-info">
            <BarChart3 size={20} className="file-icon" />
            <span className="file-label">Result Ledger (Excel/CSV)</span>
          </div>
          
          {!file ? (
             <button 
               className="file-choose-button-inline"
               onClick={() => fileInputRef.current?.click()}
             >
               <Upload size={18} /> Choose File
             </button>
          ) : (
            <div className="file-selected-inline">
              <span className="file-name">{file.name}</span>
              <button 
                className="remove-button-inline"
                onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value=''; }}
              >
                Remove
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{display:'none'}} 
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            accept=".xlsx,.xls,.csv"
          />
        </div>
      </div>

      <div className="action-footer">
        <button 
          className="process-button" 
          disabled={loading || !file}
          onClick={handleProcess}
        >
          {loading ? 'Generating...' : 'Generate API Report'}
        </button>
      </div>
    </div>
  );
}