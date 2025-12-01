import { useRef, useState } from 'react';
import { Upload, FileText, ChevronDown, CheckCircle } from 'lucide-react';
import { processingAPI, downloadFile, handleAPIError } from '../services/api';
import '../styles/SuccessIndex.css';

// Helper function to generate semester code based on batch year and semester number
function getSemesterCode(batchYear: number, semesterNumber: number): string {
  const y1 = batchYear % 100;
  const y2 = (batchYear + 1) % 100;
  const y3 = (batchYear + 2) % 100;
  const y4 = (batchYear + 3) % 100;
  
  const codes: Record<number, string> = {
    1: `W-${y1.toString().padStart(2, '0')}`,
    2: `S-${y2.toString().padStart(2, '0')}`,
    3: `W-${y2.toString().padStart(2, '0')}`,
    4: `S-${y3.toString().padStart(2, '0')}`,
    5: `W-${y3.toString().padStart(2, '0')}`,
    6: `S-${y4.toString().padStart(2, '0')}`,
  };
  
  return codes[semesterNumber] || 'Unknown';
}

export default function SuccessIndex() {
  const [batchType, setBatchType] = useState<'new' | 'old'>('new');
  const [batchYear, setBatchYear] = useState('');
  const [semester, setSemester] = useState<number | null>(null);
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  const [previousIndexFile, setPreviousIndexFile] = useState<File | null>(null);
  
  // Optional fields
  const [successIndexName, setSuccessIndexName] = useState('');
  const [batchName, setBatchName] = useState('');
  
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const studentFileRef = useRef<HTMLInputElement>(null);
  const resultFileRef = useRef<HTMLInputElement>(null);
  const previousIndexFileRef = useRef<HTMLInputElement>(null);

  const semesterOptions = [
    { value: 1, label: 'Semester I' },
    { value: 2, label: 'Semester II' },
    { value: 3, label: 'Semester III' },
    { value: 4, label: 'Semester IV' },
    { value: 5, label: 'Semester V' },
    { value: 6, label: 'Semester VI' },
  ];

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStudentFile(file);
  };

  const handleResultFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResultFile(file);
  };

  const handlePreviousIndexFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviousIndexFile(file);
  };

  const handleRemoveStudentFile = () => {
    setStudentFile(null);
    if (studentFileRef.current) studentFileRef.current.value = '';
  };

  const handleRemoveResultFile = () => {
    setResultFile(null);
    if (resultFileRef.current) resultFileRef.current.value = '';
  };

  const handleRemovePreviousIndexFile = () => {
    setPreviousIndexFile(null);
    if (previousIndexFileRef.current) previousIndexFileRef.current.value = '';
  };

  const handleSemesterSelect = (value: number) => {
    setSemester(value);
    setSemesterDropdownOpen(false);
  };

  const handleProcessData = async () => {
    // 1. Validation Logic
    if (!resultFile) {
      setError('Please upload the Semester Results file.');
      return;
    }

    if (!semester) {
      setError('Please select a semester.');
      return;
    }

    // New Batch Specific Validation
    if (batchType === 'new') {
      if (!studentFile) {
        setError('For a New Batch, the Student Enrollment Data file is required.');
        return;
      }
      if (!batchYear) {
        setError('Please enter the batch year.');
        return;
      }
    }

    // Old Batch Specific Validation
    if (batchType === 'old') {
      if (!previousIndexFile) {
        setError('For an Old Batch, please upload the previous Success Index file.');
        return;
      }
      // Note: studentFile is OPTIONAL here (used for DSY), so we don't block if missing
    }

    // Validate batch year format (only for new batch)
    let batchYearNum: number | undefined = undefined;
    if (batchType === 'new') {
      batchYearNum = parseInt(batchYear, 10);
      if (isNaN(batchYearNum) || batchYearNum < 2000 || batchYearNum > 2100) {
        setError('Please enter a valid batch year (e.g., 2022, 2023).');
        return;
      }
    }

    setIsProcessing(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Call the backend API to process files
      const resultBlob = await processingAPI.processFiles(
        resultFile,
        semester,
        studentFile || undefined, // Allow sending file if present (for DSY), or undefined
        batchYearNum,
        successIndexName || undefined,
        batchName || undefined,
        previousIndexFile || undefined
      );
      
      // Download the generated file
      const filename = `success_index_sem${semester}.xlsx`;
      downloadFile(resultBlob, filename);
      
      // Show success message
      setSuccessMessage('Success Index generated and downloaded successfully!');
      
      // Reset form after successful processing
      setTimeout(() => {
        handleReset();
      }, 3000);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStudentFile(null);
    setResultFile(null);
    setPreviousIndexFile(null);
    setSemester(null);
    setBatchYear('');
    setSuccessIndexName('');
    setBatchName('');
    setError('');
    setSuccessMessage('');
    if (studentFileRef.current) studentFileRef.current.value = '';
    if (resultFileRef.current) resultFileRef.current.value = '';
    if (previousIndexFileRef.current) previousIndexFileRef.current.value = '';
  };

  return (
    <div className="success-index-container" data-testid="success-index-container">
      <div className="success-index-header">
        <h2 className="page-subtitle" data-testid="success-index-title">Success Index</h2>
        <p className="page-description">Upload student enrollment data and semester results to calculate success metrics</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="message-box error-message">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="message-box success-message">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Batch Configuration Section */}
      <div className="batch-config-section">
        <h3 className="section-title">Batch Configuration</h3>
        
        {/* Batch Type Selection */}
        <div className="form-group">
          <label className="form-label">Batch Type *</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="batchType"
                value="new"
                checked={batchType === 'new'}
                onChange={(e) => setBatchType(e.target.value as 'new' | 'old')}
              />
              <span>New Batch (First Year)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="batchType"
                value="old"
                checked={batchType === 'old'}
                onChange={(e) => setBatchType(e.target.value as 'new' | 'old')}
              />
              <span>Old Batch (Updating / Adding DSY)</span>
            </label>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Success Index Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., BCA Success Index 2022-25"
              value={successIndexName}
              onChange={(e) => setSuccessIndexName(e.target.value)}
            />
            <p className="form-hint">Optional: Custom name for the Success Index</p>
          </div>

          <div className="form-group">
            <label className="form-label">Batch Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., FYME (2022-23) & LATERAL ENTRY DSYME (2023-24)"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
            <p className="form-hint">Optional: Batch identifier name</p>
          </div>
        </div>

        {/* Batch Year - Only for New Batch */}
        {batchType === 'new' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Batch Start Year *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 2022"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
              />
              <p className="form-hint">Year when the batch started (e.g., 2022 for FY 2022-23)</p>
            </div>
          </div>
        )}

        {/* Semester Selection */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Semester *</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-trigger"
                onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
                type="button"
              >
                <span className={semester ? 'dropdown-value' : 'dropdown-placeholder'}>
                  {semester ? semesterOptions.find(opt => opt.value === semester)?.label : 'Select Semester'}
                </span>
                <ChevronDown size={20} className={`dropdown-icon ${semesterDropdownOpen ? 'open' : ''}`} />
              </button>
              {semesterDropdownOpen && (
                <div className="dropdown-menu">
                  {semesterOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`dropdown-option ${semester === option.value ? 'selected' : ''}`}
                      onClick={() => handleSemesterSelect(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Semester Info */}
        {batchType === 'new' && batchYear && semester && (
          <div className="semester-info">
            <p className="semester-info-text">
              Processing: <strong>Semester {semester}</strong> ({getSemesterCode(parseInt(batchYear), semester)}) for batch starting {batchYear}
            </p>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="file-upload-section">
        <h3 className="section-title">Upload Files</h3>
        
        {/* Student Enrollment Data */}
        <div className="file-upload-row" data-testid="student-data-upload-card">
          <div className="file-upload-info">
            <FileText size={20} className="file-icon" />
            <span className="file-label">
              Student Enrollment Data 
              {batchType === 'old' && <span style={{fontWeight: 'normal', color: '#666', fontSize: '13px', marginLeft: '5px'}}>(Optional - for DSY/New Students)</span>}
            </span>
          </div>
          {!studentFile ? (
            <button
              className="file-choose-button-inline"
              onClick={() => studentFileRef.current?.click()}
              data-testid="student-upload-button"
              type="button"
            >
              <Upload size={18} />
              <span>Choose File</span>
            </button>
          ) : (
            <div className="file-selected-inline" data-testid="student-file-selected">
              <span className="file-name">{studentFile.name}</span>
              <button
                className="remove-button-inline"
                onClick={handleRemoveStudentFile}
                data-testid="remove-student-file-button"
                type="button"
              >
                Remove
              </button>
            </div>
          )}
          <input
            ref={studentFileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleStudentFileChange}
            style={{ display: 'none' }}
            data-testid="student-file-input"
          />
        </div>

        {/* Semester Results */}
        <div className="file-upload-row" data-testid="result-data-upload-card">
          <div className="file-upload-info">
            <FileText size={20} className="file-icon" />
            <span className="file-label">Semester Results *</span>
          </div>
          {!resultFile ? (
            <button
              className="file-choose-button-inline"
              onClick={() => resultFileRef.current?.click()}
              data-testid="result-upload-button"
              type="button"
            >
              <Upload size={18} />
              <span>Choose File</span>
            </button>
          ) : (
            <div className="file-selected-inline" data-testid="result-file-selected">
              <span className="file-name">{resultFile.name}</span>
              <button
                className="remove-button-inline"
                onClick={handleRemoveResultFile}
                data-testid="remove-result-file-button"
                type="button"
              >
                Remove
              </button>
            </div>
          )}
          <input
            ref={resultFileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleResultFileChange}
            style={{ display: 'none' }}
            data-testid="result-file-input"
          />
        </div>

        {/* Previous Success Index (Old Batch Only) */}
        {batchType === 'old' && (
          <div className="file-upload-row" data-testid="previous-index-upload-card">
            <div className="file-upload-info">
              <FileText size={20} className="file-icon" />
              <span className="file-label">Previous Success Index *</span>
            </div>
            {!previousIndexFile ? (
              <button
                className="file-choose-button-inline"
                onClick={() => previousIndexFileRef.current?.click()}
                data-testid="previous-index-upload-button"
                type="button"
              >
                <Upload size={18} />
                <span>Choose File</span>
              </button>
            ) : (
              <div className="file-selected-inline" data-testid="previous-index-file-selected">
                <span className="file-name">{previousIndexFile.name}</span>
                <button
                  className="remove-button-inline"
                  onClick={handleRemovePreviousIndexFile}
                  data-testid="remove-previous-index-file-button"
                  type="button"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={previousIndexFileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handlePreviousIndexFileChange}
              style={{ display: 'none' }}
              data-testid="previous-index-file-input"
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="action-footer">
        <button
          className="process-button"
          disabled={
            !resultFile || 
            !semester || 
            (batchType === 'new' && (!batchYear || !studentFile)) ||
            (batchType === 'old' && !previousIndexFile) ||
            isProcessing
          }
          onClick={handleProcessData}
          data-testid="process-button"
        >
          {isProcessing ? 'Processing...' : 'Generate Success Index'}
        </button>
        <p className="footer-note">
          {batchType === 'new' 
            ? 'Processing new batch - requires student list' 
            : 'Updates existing batch. Upload student list to add DSY/new students.'}
        </p>
      </div>
    </div>
  );
}


