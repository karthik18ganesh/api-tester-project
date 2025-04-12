
import React, { useState } from "react";

const ResponseViewer = ({ response = "", statusCode = "", contentType = "JSON" }) => {
  const [format, setFormat] = useState(contentType);

  const formatResponse = (res) => {
    if (!res) return "";
    if (format === "JSON") {
      try {
        return JSON.stringify(JSON.parse(res), null, 2);
      } catch {
        return res;
      }
    }
    return res;
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-700">
          Status: <span className="font-bold">{statusCode || "N/A"}</span>
        </div>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="text-sm border rounded p-1"
        >
          <option value="JSON">JSON</option>
          <option value="HTML">HTML</option>
          <option value="Text">Text</option>
        </select>
      </div>

      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm whitespace-pre-wrap">
        {formatResponse(response)}
      </pre>
    </div>
  );
};

export default ResponseViewer;
