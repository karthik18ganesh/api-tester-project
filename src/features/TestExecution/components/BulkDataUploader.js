import React, { useState, useRef } from 'react';
import {
  FiUpload,
  FiFile,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiLayers,
} from 'react-icons/fi';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const BulkDataUploader = ({
  onFileUpload,
  onValidation,
  testCaseId,
  testCaseName,
}) => {
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validateExcelStructure = (workbook) => {
    const requiredColumns = ['Row_ID', 'Active'];
    const optionalColumns = [
      'Test_Name',
      'Headers',
      'Query_Params',
      'Request_Body',
      'Expected_Status',
      'Assertions',
      'Variables_Extract',
      'Environment',
      'Timeout',
      'Retry_Count',
      'Delay_After',
    ];

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validation logic
    const errors = [];
    const warnings = [];

    // Check for empty file
    if (jsonData.length === 0) {
      errors.push('Excel file contains no data rows');
      return {
        valid: false,
        errors,
        warnings,
        data: [],
        totalRows: 0,
        activeRows: 0,
      };
    }

    // Check required columns
    const columns = Object.keys(jsonData[0]);
    requiredColumns.forEach((col) => {
      if (!columns.includes(col)) {
        errors.push(`Missing required column: ${col}`);
      }
    });

    // Validate each row
    jsonData.forEach((row, index) => {
      const rowNum = index + 3; // Account for header and description rows

      // Validate Row_ID
      if (!row.Row_ID) {
        errors.push(`Row ${rowNum}: Missing Row_ID`);
      }

      // Validate JSON fields
      [
        'Headers',
        'Query_Params',
        'Request_Body',
        'Assertions',
        'Variables_Extract',
      ].forEach((field) => {
        if (row[field] && typeof row[field] === 'string' && row[field].trim()) {
          try {
            JSON.parse(row[field]);
          } catch (e) {
            errors.push(
              `Row ${rowNum} (ID: ${row.Row_ID}): Invalid JSON in ${field}`
            );
          }
        }
      });

      // Note: URL and Method are not validated as they come from the test case

      // Validate Active field
      if (
        row.Active !== 'TRUE' &&
        row.Active !== 'FALSE' &&
        row.Active !== true &&
        row.Active !== false
      ) {
        warnings.push(
          `Row ${rowNum} (ID: ${row.Row_ID}): Active should be TRUE or FALSE`
        );
      }
    });

    const activeData = jsonData.filter(
      (row) => row.Active === true || row.Active === 'TRUE'
    );

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: activeData,
      totalRows: jsonData.length,
      activeRows: activeData.length,
    };
  };

  const handleFileSelect = async (file) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(file);
    setValidating(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const validation = validateExcelStructure(workbook);
          setValidationResults(validation);

          if (validation.valid) {
            onValidation(validation);
            onFileUpload(file, validation.data);
            toast.success(`Loaded ${validation.activeRows} active data sets`);
          } else {
            toast.error(
              `Validation failed with ${validation.errors.length} errors`
            );
          }
        } catch (error) {
          console.error('Error parsing Excel:', error);
          toast.error('Failed to parse Excel file');
          setValidationResults({
            valid: false,
            errors: ['Failed to parse Excel file: ' + error.message],
            warnings: [],
          });
        }

        setValidating(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
      setValidating(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const files = e.dataTransfer.files;
          if (files[0]) handleFileSelect(files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            if (e.target.files[0]) handleFileSelect(e.target.files[0]);
          }}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaFileExcel className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to upload
              </button>
              {' or drag and drop'}
            </div>
            <p className="text-xs text-gray-500">
              Excel files only (.xlsx, .xls)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <FaFileExcel className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  setValidationResults(null);
                }}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <FiX className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {validating && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Validating...</span>
              </div>
            )}

            {validationResults && !validating && (
              <div className="mt-3">
                {validationResults.valid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">
                          Validation Successful
                        </div>
                        <div className="text-green-700 mt-1">
                          <div>
                            • Total data rows: {validationResults.totalRows}
                          </div>
                          <div>
                            • Active data sets to test:{' '}
                            {validationResults.activeRows}
                          </div>
                          <div>• Test Case: {testCaseName}</div>
                        </div>
                        {validationResults.warnings.length > 0 && (
                          <div className="mt-2 text-yellow-700">
                            <div className="font-medium">Warnings:</div>
                            {validationResults.warnings
                              .slice(0, 2)
                              .map((warning, i) => (
                                <div key={i} className="text-xs mt-1">
                                  ⚠ {warning}
                                </div>
                              ))}
                            {validationResults.warnings.length > 2 && (
                              <div className="text-xs mt-1">
                                ...and {validationResults.warnings.length - 2}{' '}
                                more warnings
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-red-800">
                          Validation Failed
                        </div>
                        <div className="text-red-700 mt-1">
                          {validationResults.errors
                            .slice(0, 3)
                            .map((error, i) => (
                              <div key={i} className="text-xs mt-1">
                                • {error}
                              </div>
                            ))}
                          {validationResults.errors.length > 3 && (
                            <div className="text-xs mt-1 font-medium">
                              ...and {validationResults.errors.length - 3} more
                              errors
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkDataUploader;
