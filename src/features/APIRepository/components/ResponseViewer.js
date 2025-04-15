
import React from "react";

const ResponseViewer = ({ statusCode, response, contentType }) => {
  const formatOptions = ["JSON", "HTML", "Text"];

  const badgeColor = statusCode.startsWith("2")
    ? "bg-green-100 text-green-700"
    : statusCode.startsWith("4")
    ? "bg-yellow-100 text-yellow-700"
    : statusCode.startsWith("5")
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white border rounded shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColor}`}>
          Status: {statusCode || "No response"}
        </div>
        <div className="text-sm">
          <label className="mr-2 text-gray-600">Format:</label>
          <select className="border rounded px-2 py-1 text-sm">
            {formatOptions.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <pre className="bg-gray-50 text-sm p-4 border rounded overflow-auto max-h-80 whitespace-pre-wrap font-mono">
        {response || "No response body"}
      </pre>
    </div>
  );
};

export default ResponseViewer;
