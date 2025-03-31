import React from "react";

const Workspace = () => {
  return (
    <div className="p-6 flex-1">
      <h1 className="text-2xl font-semibold mb-4">API Repository</h1>

      <div className="bg-white p-4 shadow-md rounded">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            API Name
          </label>
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter API Name"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Path
          </label>
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="/api/example"
          />
        </div>

        <div className="flex space-x-4 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Method
            </label>
            <select className="border px-3 py-2 rounded w-full">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select className="border px-3 py-2 rounded w-full">
              <option>RESTful</option>
              <option>SOAP</option>
            </select>
          </div>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </div>
    </div>
  );
};

export default Workspace;
