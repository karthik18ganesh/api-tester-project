import React, { useState, useCallback, useRef } from 'react';
import { 
  FiUpload, 
  FiFile, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiDownload,
  FiEye,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiInfo,
  FiFileText,
  FiDatabase,
  FiFolder,
  FiArchive,
  FiLayers
} from 'react-icons/fi';
import { FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import Badge from '../../../components/UI/Badge';
import { useAuthStore } from '../../../stores/authStore';
import { useProjectStore } from '../../../stores/projectStore';
import {
  downloadTemplate as downloadBulkTemplate,
  validateBulkUpload,
  processBulkUpload,
  transformValidationResponse,
} from '../../../utils/bulkUploadApi';

// Note: Previously mocked processing is removed in favor of real API integration

const stepConfig = [
  { id: 'upload', title: 'Upload File', description: 'Select and upload your Excel file', icon: <FiUpload /> },
  { id: 'validate', title: 'Validate Data', description: 'Verify data structure and content', icon: <FiCheckCircle /> },
  { id: 'preview', title: 'Preview & Review', description: 'Review parsed data before processing', icon: <FiEye /> },
  { id: 'process', title: 'Process & Create', description: 'Create test components in the system', icon: <FiPlay /> }
];

const sheetTypeConfig = {
  // Canonical keys
  'package': {
    label: 'Test Packages',
    icon: <FiArchive className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Test package definitions and configurations'
  },
  'suite': {
    label: 'Test Suites',
    icon: <FiFolder className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Test suite groupings with package associations'
  },
  'test-case': {
    label: 'Test Cases',
    icon: <FiFileText className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Individual test cases with API associations'
  }
};

// Helpers to normalize API variations
const normalizeSheetType = (rawType) => {
  if (!rawType) return 'unknown';
  const type = String(rawType).trim().toLowerCase();
  if (type === 'package' || type === 'test_package' || type === 'test-package') return 'package';
  if (type === 'suite' || type === 'test_suite' || type === 'test-suite') return 'suite';
  if (type === 'test case' || type === 'test_case' || type === 'test-case') return 'test-case';
  return type;
};

const normalizeValidationStatus = (status) => {
  if (!status) return 'unknown';
  const s = String(status).trim().toLowerCase();
  if (s === 'success' || s === 'valid' || s === 'ok' || s === 'passed') return 'valid';
  if (s === 'warning' || s === 'warn') return 'warning';
  if (s === 'error' || s === 'failed' || s === 'fail') return 'error';
  return s;
};

const SPECIAL_COLUMN_ALIASES = {
  'suite_name': 'suiteName',
  'suite name': 'suiteName',
  'package_name': 'packageName',
  'package name': 'packageName',
  'testcase name': 'testCaseName',
  'test case name': 'testCaseName',
  'test case id': 'testCaseId',
  'type': 'type',
  'response type': 'responseType',
  'report type': 'reportType',
  'project id': 'projectId',
};

const toCamelCase = (label) => {
  const cleaned = String(label).trim().replace(/[^a-zA-Z0-9_\s]/g, '');
  const parts = cleaned.split(/[\s_]+/g).filter(Boolean);
  if (parts.length === 0) return cleaned;
  const [first, ...rest] = parts;
  return first.toLowerCase() + rest.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
};

const columnToKey = (columnLabel) => {
  const trimmed = String(columnLabel).trim();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ');
  if (SPECIAL_COLUMN_ALIASES[normalized]) return SPECIAL_COLUMN_ALIASES[normalized];
  const snakeLike = normalized.replace(/\s+/g, '_');
  if (SPECIAL_COLUMN_ALIASES[snakeLike]) return SPECIAL_COLUMN_ALIASES[snakeLike];
  return toCamelCase(trimmed);
};

const getCellValue = (row, columnLabel) => {
  if (!row) return '';
  const direct = row[columnLabel];
  if (direct !== undefined && direct !== null) return String(direct);

  const trimmed = row[String(columnLabel).trim()];
  if (trimmed !== undefined && trimmed !== null) return String(trimmed);

  const candidateKey = columnToKey(columnLabel);
  if (row[candidateKey] !== undefined && row[candidateKey] !== null) return String(row[candidateKey]);

  const normalized = String(columnLabel).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchKey = Object.keys(row).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
  if (matchKey && row[matchKey] !== undefined && row[matchKey] !== null) return String(row[matchKey]);

  return '';
};

const BulkUpload = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null); // transformed validation response
  const [uploadId, setUploadId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [createProgress, setCreateProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [previewRowLimit, setPreviewRowLimit] = useState(20);
  const fileInputRef = useRef(null);
  const userId = useAuthStore((s) => s.userId);
  const activeProject = useProjectStore((s) => s.activeProject);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file.name.match(/\.xlsx$/i)) {
      alert('Please upload a valid Excel .xlsx file');
      return;
    }

    if (!activeProject?.id || !userId) {
      alert('Missing active project or user. Please ensure you are logged in and a project is selected.');
      return;
    }

    setUploadedFile(file);
    setCurrentStep('validate');
    setProcessing(true);

    try {
      const res = await validateBulkUpload({ file, userId, projectId: activeProject.id });
      const transformed = transformValidationResponse(res);
      setProcessedData(transformed);
      setUploadId(transformed.uploadId || res?.data?.uploadId || null);
      setCreateProgress({ current: 0, total: transformed.totalRows || 0, status: 'idle' });
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error validating file:', error);
      alert(error?.message || 'Validation failed. Please check your file and try again.');
      setCurrentStep('upload');
      setUploadedFile(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setProcessedData(null);
    setUploadId(null);
    setCurrentStep('upload');
    setCreateProgress({ current: 0, total: 0, status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTestComponents = async () => {
    if (!uploadId || !activeProject?.id || !userId) return;
    setCurrentStep('process');
    setCreateProgress({ current: 0, total: processedData?.totalRows || 0, status: 'processing' });

    try {
      await processBulkUpload({ uploadId, projectId: activeProject.id, userId, confirmWarnings: false });
      setCreateProgress(prev => ({ ...prev, current: prev.total, status: 'completed' }));
      alert('Bulk upload processed successfully.');
    } catch (err) {
      console.error('Process failed:', err);
      alert(err?.message || 'Processing failed.');
      // Return to preview so user can retry
      setCurrentStep('preview');
      setCreateProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const openPreviewModal = (sheet) => {
    setSelectedSheet(sheet);
    setShowPreviewModal(true);
    setPreviewRowLimit(20);
  };

  const downloadTemplate = () => {
    downloadBulkTemplate().catch((e) => {
      console.error('Template download failed', e);
      alert('Failed to download template.');
    });
  };

  const getStepStatus = (stepId) => {
    const stepIndex = stepConfig.findIndex(s => s.id === stepId);
    const currentIndex = stepConfig.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FiLayers className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bulk Upload</h1>
              <p className="text-emerald-100 mt-1">
                Import Test Packages, Suites, and Cases from Excel files
              </p>
            </div>
          </div>
          <div className="text-right">
            <Button
              onClick={downloadTemplate}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Progress</h2>
          {uploadedFile && (
            <Button
              onClick={resetUpload}
              variant="secondary"
              size="sm"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {stepConfig.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${status === 'current' ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                    ${status === 'pending' ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                  `}>
                    {status === 'completed' ? <FiCheckCircle className="h-6 w-6" /> : step.icon}
                  </div>
                  <div className="text-center mt-3">
                    <div className={`text-sm font-medium ${status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 ${status === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < stepConfig.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4 transition-all
                    ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragActive 
                ? 'border-emerald-400 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`
                  p-4 rounded-full transition-all
                  ${dragActive ? 'bg-emerald-200' : 'bg-gray-100'}
                `}>
                  <FaCloudUploadAlt className={`
                    h-12 w-12 transition-all
                    ${dragActive ? 'text-emerald-600' : 'text-gray-400'}
                  `} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dragActive ? 'Drop your Excel file here' : 'Upload Your Excel File'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiFile className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                Supported format: .xlsx | Maximum size: 10MB
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Excel File Structure</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Sheet 1 - Test Packages:</strong> Package Name, Description, Environment, Priority, Owner</p>
                  <p><strong>Sheet 2 - Test Suites:</strong> Suite Name, Package Name, Description, Priority, Tags</p>
                  <p><strong>Sheet 3 - Test Cases:</strong> Case Name, Suite Name, API ID, Method, Description, Priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {currentStep === 'validate' && processing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your File</h3>
              <p className="text-gray-600">Analyzing Excel structure and validating data...</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FaFileExcel className="h-5 w-5 text-green-600" />
                <span>File: {uploadedFile?.name}</span>
                <span>•</span>
                <span>Size: {(uploadedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Validation Results */
      }
      {currentStep === 'preview' && processedData && (
        <div className="space-y-6">
          {/* File Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <FiCheckCircle className="h-4 w-4 mr-1" />
                Processing Complete
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{processedData.sheets.length}</div>
                <div className="text-sm text-gray-600">Sheets Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{processedData.totalRows ?? processedData.sheets.reduce((sum, s) => sum + (s.rows || s.rowCount || 0), 0)}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{
                  processedData.sheets.filter(s => normalizeValidationStatus(s.validationStatus) === 'valid').length
                }</div>
                <div className="text-sm text-gray-600">Valid Sheets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{
                  processedData.sheets.filter(s => normalizeValidationStatus(s.validationStatus) === 'warning').length
                }</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <strong>File:</strong> {processedData.fileName} • 
              <strong> Size:</strong> {processedData.fileSize ? `${(processedData.fileSize / 1024).toFixed(0)} KB` : '—'} • 
              <strong> Processing Time:</strong> {processedData.processingTime ?? processedData.processing_time ?? '—'}s • 
              <strong> Status:</strong> {
                (() => {
                  const statuses = processedData.sheets.map(s => normalizeValidationStatus(s.validationStatus));
                  if (statuses.includes('error')) return 'Errors Found';
                  if (statuses.includes('warning')) return 'Warnings';
                  return 'Validated';
                })()
              }
            </div>
          </div>

          {/* Sheets Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detected Sheets</h3>
            
            <div className="grid gap-4">
              {processedData.sheets.map((sheet, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {(() => { const t = normalizeSheetType(sheet.type); return (
                        <div className={`p-2 rounded-lg ${sheetTypeConfig[t]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {sheetTypeConfig[t]?.icon || <FiFile className="h-5 w-5" />}
                        </div>
                      ); })()}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{sheet.name}</h4>
                          {(() => { const t = normalizeSheetType(sheet.type); return (
                            <Badge className={sheetTypeConfig[t]?.color || 'bg-gray-100 text-gray-800'}>
                              {sheetTypeConfig[t]?.label || 'Unknown'}
                            </Badge>
                          ); })()}
                          {(() => { const vs = normalizeValidationStatus(sheet.validationStatus); return (
                            <Badge className={
                              vs === 'valid' ? 'bg-green-100 text-green-800 border-green-200' :
                              vs === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }>
                              {vs === 'valid' && <FiCheckCircle className="h-3 w-3 mr-1" />}
                              {vs === 'warning' && <FiAlertTriangle className="h-3 w-3 mr-1" />}
                              {vs === 'error' && <FiXCircle className="h-3 w-3 mr-1" />}
                              {vs}
                            </Badge>
                          ); })()}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {(() => { const t = normalizeSheetType(sheet.type); return sheetTypeConfig[t]?.description || 'Sheet'; })()} • {sheet.rows || sheet.rowCount} rows • {sheet.columns.length} columns
                        </p>
                        {sheet.errors.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block">
                              {sheet.errors.length} validation issue{sheet.errors.length > 1 ? 's' : ''} found
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => openPreviewModal(sheet)}
                      variant="secondary"
                      size="sm"
                    >
                      <FiEye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={resetUpload}
                variant="secondary"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateTestComponents}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={processedData.sheets.some(s => normalizeValidationStatus(s.validationStatus) === 'error')}
              >
                <FiPlay className="h-4 w-4 mr-2" />
                Create Test Components
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {currentStep === 'process' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {createProgress.status === 'completed' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="animate-pulse w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FiLayers className="h-8 w-8 text-emerald-600" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {createProgress.status === 'completed' ? 'Test Components Created Successfully!' : 'Creating Test Components'}
              </h3>
              <p className="text-gray-600">
                {createProgress.status === 'completed' 
                  ? 'All test packages, suites, and cases have been created and are ready for use.'
                  : 'Please wait while we create your test components in the system...'
                }
              </p>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{createProgress.current} / {createProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(createProgress.current / createProgress.total) * 100}%` }}
                />
              </div>
            </div>

            {createProgress.status === 'completed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-purple-600">
                      {processedData.sheets.find(s => s.type === 'test-package')?.rows || 0}
                    </div>
                    <div className="text-sm text-purple-700">Test Packages</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {processedData.sheets.find(s => s.type === 'test-suite')?.rows || 0}
                    </div>
                    <div className="text-sm text-blue-700">Test Suites</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-green-600">
                      {processedData.sheets.find(s => s.type === 'test-case')?.rows || 0}
                    </div>
                    <div className="text-sm text-green-700">Test Cases</div>
                  </div>
                </div>
                
                <Button
                  onClick={resetUpload}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiUpload className="h-4 w-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Preview: ${selectedSheet?.name}`}
        size="7xl"
      >
        {selectedSheet && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {(() => { const t = normalizeSheetType(selectedSheet.type); return (
                <Badge className={sheetTypeConfig[t]?.color}>
                  {sheetTypeConfig[t]?.icon}
                  <span className="ml-2">{sheetTypeConfig[t]?.label}</span>
                </Badge>
              ); })()}
              <div className="text-sm text-gray-600">
                {(selectedSheet.rows || selectedSheet.rowCount)} rows • {selectedSheet.columns.length} columns
              </div>
            </div>

            {/* Mapping chips removed per request */}

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Previewing first {previewRowLimit === 'all' ? (selectedSheet.data?.length || 0) : previewRowLimit} row(s)</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rows:</label>
                <select
                  value={previewRowLimit}
                  onChange={(e) => setPreviewRowLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={'all'}>All</option>
                </select>
              </div>
            </div>

            {selectedSheet.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Validation Issues</h4>
                <div className="space-y-1">
                  {selectedSheet.errors.map((error, index) => (
                    <div key={index} className="text-sm text-amber-700">
                      Row {error.row}, Column "{error.column}": {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-auto max-h-[70vh] rounded-md border border-gray-200">
              <table className="w-full text-sm table-auto">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="divide-x divide-gray-200">
                    {selectedSheet.columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-3 py-2 text-left font-semibold text-gray-700 border-b whitespace-normal break-words align-top min-w-[160px] text-xs md:text-sm"
                        title={column}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(() => {
                    const sampleKeys = Object.keys(selectedSheet.data[0] || {});
                    const limit = previewRowLimit === 'all' ? selectedSheet.data.length : previewRowLimit;
                    return selectedSheet.data.slice(0, limit).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {selectedSheet.columns.map((column, colIndex) => {
                          const mappedKey = sampleKeys[colIndex];
                          const value = mappedKey !== undefined ? row[mappedKey] : getCellValue(row, column);
                          const display = value === undefined || value === null || value === '' ? '—' : String(value);
                          return (
                            <td key={colIndex} className="px-3 py-2 text-gray-900 align-top max-w-[320px] break-words" title={display}>
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                  {(() => { const remaining = selectedSheet.data.length - (previewRowLimit === 'all' ? selectedSheet.data.length : previewRowLimit); return remaining > 0 ? (
                    <tr>
                      <td colSpan={selectedSheet.columns.length} className="px-3 py-2 text-center text-gray-500 italic">
                        ... and {remaining} more rows
                      </td>
                    </tr>
                  ) : null; })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BulkUpload; 