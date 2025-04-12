
import React, { useState } from "react";

const AuthTab = () => {
  const [authType, setAuthType] = useState("No Auth");
  const [credentials, setCredentials] = useState({
    bearerToken: "",
    basicUsername: "",
    basicPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Authorization Type</label>
        <select
          value={authType}
          onChange={(e) => setAuthType(e.target.value)}
          className="border px-3 py-2 rounded w-60 text-sm"
        >
          <option>No Auth</option>
          <option>Bearer Token</option>
          <option>Basic Auth</option>
        </select>
      </div>

      {authType === "Bearer Token" && (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Token</label>
          <input
            type="text"
            name="bearerToken"
            value={credentials.bearerToken}
            onChange={handleChange}
            placeholder="Enter bearer token"
            className="w-full border px-3 py-2 rounded text-sm"
          />
        </div>
      )}

      {authType === "Basic Auth" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="basicUsername"
              value={credentials.basicUsername}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="basicPassword"
              value={credentials.basicPassword}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
        </div>
      )}

      {authType === "No Auth" && (
        <p className="text-sm text-gray-500">No authorization will be sent with this request.</p>
      )}
    </div>
  );
};

export default AuthTab;
