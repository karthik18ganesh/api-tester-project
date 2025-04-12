
import React, { useState } from "react";

const BodyTab = () => {
  const [bodyType, setBodyType] = useState("none");
  const [rawFormat, setRawFormat] = useState("JSON");
  const [rawContent, setRawContent] = useState("");
  const [formData, setFormData] = useState([{ key: "", value: "", type: "text" }]);
  const [urlEncodedData, setUrlEncodedData] = useState([{ key: "", value: "" }]);

  const handleChange = (index, field, value, type = "form") => {
    const data = type === "form" ? [...formData] : [...urlEncodedData];
    data[index][field] = value;
    type === "form" ? setFormData(data) : setUrlEncodedData(data);
  };

  const addRow = (type = "form") => {
    const newRow = type === "form"
      ? { key: "", value: "", type: "text" }
      : { key: "", value: "" };
    type === "form"
      ? setFormData([...formData, newRow])
      : setUrlEncodedData([...urlEncodedData, newRow]);
  };

  const removeRow = (index, type = "form") => {
    const updated = type === "form" ? [...formData] : [...urlEncodedData];
    updated.splice(index, 1);
    type === "form" ? setFormData(updated) : setUrlEncodedData(updated);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4 text-sm">
        {["none", "raw", "form-data", "x-www-form-urlencoded"].map((type) => (
          <button
            key={type}
            onClick={() => setBodyType(type)}
            className={`pb-2 capitalize ${
              bodyType === type
                ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                : "text-gray-500 hover:text-[#4F46E5]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* None */}
      {bodyType === "none" && (
        <div className="text-sm text-gray-500">This request does not have a body.</div>
      )}

      {/* Raw */}
      {bodyType === "raw" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Format:</label>
            <select
              value={rawFormat}
              onChange={(e) => setRawFormat(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {["JSON", "Text", "HTML", "XML"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <textarea
            rows="10"
            placeholder="Enter request body here..."
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="w-full border px-3 py-2 text-sm font-mono rounded bg-gray-50"
          />
        </div>
      )}

      {/* Form-Data */}
      {bodyType === "form-data" && (
        <div className="space-y-2">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleChange(idx, "key", e.target.value, "form")}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type={item.type}
                      value={item.value}
                      onChange={(e) => handleChange(idx, "value", e.target.value, "form")}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.type}
                      onChange={(e) => handleChange(idx, "type", e.target.value, "form")}
                      className="w-full border px-2 py-1 rounded"
                    >
                      <option value="text">Text</option>
                      <option value="file">File</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeRow(idx, "form")}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => addRow("form")}
            className="mt-2 px-4 py-2 text-sm bg-[#4F46E5] text-white rounded hover:bg-[#4338CA]"
          >
            + Add Form Data
          </button>
        </div>
      )}

      {/* x-www-form-urlencoded */}
      {bodyType === "x-www-form-urlencoded" && (
        <div className="space-y-2">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {urlEncodedData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleChange(idx, "key", e.target.value, "url")}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleChange(idx, "value", e.target.value, "url")}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeRow(idx, "url")}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => addRow("url")}
            className="mt-2 px-4 py-2 text-sm bg-[#4F46E5] text-white rounded hover:bg-[#4338CA]"
          >
            + Add Param
          </button>
        </div>
      )}
    </div>
  );
};

export default BodyTab;
