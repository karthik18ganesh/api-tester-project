import React from 'react';
import { toast } from 'react-toastify';

const FileUploadSection = ({
  requestTemplate,
  responseTemplate,
  uploadedRequestFileName,
  uploadedResponseFileName,
  onRequestTemplateChange,
  onResponseTemplateChange,
  onRequestFileNameChange,
  onResponseFileNameChange,
  onShowPreview,
  loading
}) => {
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target.result);
          const formatted = JSON.stringify(content, null, 2);
          if (type === "request") {
            onRequestFileNameChange(file.name);
            onRequestTemplateChange(formatted);
          } else {
            onResponseFileNameChange(file.name);
            onResponseTemplateChange(formatted);
          }
        } catch (error) {
          toast.error("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a valid JSON file.");
    }
  };

  const FileUploadInput = ({ id, type, template, fileName, label }) => (
    <div>
      <label className="block font-medium mb-2 text-sm">
        {label} <span className="text-gray-500">(Optional)</span>
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          id={id}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleFileUpload(e, type)}
          disabled={loading}
        />
        <label
          htmlFor={id}
          className={`cursor-pointer border px-4 py-2 text-sm rounded bg-white hover:bg-gray-100 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Click to upload
        </label>
        {template && (
          <>
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {fileName}
            </span>
            <button
              type="button"
              className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] transition-colors"
              onClick={() => onShowPreview({ type, content: template })}
              disabled={loading}
            >
              Preview
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Note: Parameters in templates are not used for variable detection
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <FileUploadInput
        id="request-template"
        type="request"
        template={requestTemplate}
        fileName={uploadedRequestFileName}
        label="Request template"
      />
      <FileUploadInput
        id="response-template"
        type="response"
        template={responseTemplate}
        fileName={uploadedResponseFileName}
        label="Response template"
      />
    </div>
  );
};

export default FileUploadSection; 