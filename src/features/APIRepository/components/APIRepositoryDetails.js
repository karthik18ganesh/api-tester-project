
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import APIFormTop from "./APIFormTop";
import RequestTabs from "./RequestTabs";
import HeadersTab from "./RequestConfigTabs/HeadersTab";
import AuthTab from "./RequestConfigTabs/AuthTab";
import BodyTab from "./RequestConfigTabs/BodyTab";
import QueryParamsTab from "./RequestConfigTabs/QueryParamsTab";
import ResponseViewer from "./ResponseViewer";
import Breadcrumb from "../../../components/common/Breadcrumb";
import { toast } from "react-toastify";

const APIRepositoryDetails = () => {
  const location = useLocation();
  const isEditMode = !!location.state?.api;
  const [activeTab, setActiveTab] = useState("Headers");
  const [formData, setFormData] = useState({
    method: "GET",
    url: "",
    name: "",
    environment: "",
    description: ""
  });
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [rawBody, setRawBody] = useState("");
  const [responseData, setResponseData] = useState({
    statusCode: "",
    content: "",
    contentType: "JSON"
  });

  useEffect(() => {
    if (isEditMode && location.state?.api) {
      setFormData(location.state.api);
    }
  }, [isEditMode, location.state]);

  const handleSend = async () => {
    if (!formData.url || !formData.method) {
      toast.error("URL and Method are required to send a request.");
      return;
    }

    try {
      const url = new URL(formData.url);
      queryParams.forEach(param => {
        if (param.key && param.value) {
          url.searchParams.append(param.key, param.value);
        }
      });

      const options = {
        method: formData.method,
        headers: headers.reduce((acc, cur) => {
          if (cur.key && cur.value) acc[cur.key] = cur.value;
          return acc;
        }, {}),
        body: ["POST", "PUT", "PATCH"].includes(formData.method) ? rawBody : undefined
      };

      const res = await fetch(url.toString(), options);
      const contentType = res.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");
      const responseBody = isJson ? await res.json() : await res.text();

      setResponseData({
        statusCode: res.status + " " + res.statusText,
        content: isJson ? JSON.stringify(responseBody, null, 2) : responseBody,
        contentType: isJson ? "JSON" : "Text"
      });

      toast.success("Request sent successfully");
    } catch (error) {
      console.error("API Error:", error);
      setResponseData({
        statusCode: "Error",
        content: error.message,
        contentType: "Text"
      });
      toast.error("Failed to send request");
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.url || !formData.method) {
      toast.error("Please fill in required fields (name, url, method)");
      return;
    }

    toast.success(
      `${isEditMode ? "Updated" : "Created"} API: "${formData.name}" successfully`
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Headers": return <HeadersTab headers={headers} setHeaders={setHeaders} />;
      case "Authorization": return <AuthTab />;
      case "Body": return <BodyTab rawBody={rawBody} setRawBody={setRawBody} />;
      case "Query Params": return <QueryParamsTab params={queryParams} setParams={setQueryParams} />;
      default: return null;
    }
  };

  const environmentList = [
    { _id: "env1", name: "Development" },
    { _id: "env2", name: "Production" }
  ];

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "API Design" },
          { label: "API Repository", path: "/api-design/api-repository" },
          { label: isEditMode ? "Edit" : "Create" }
        ]}
      />

      <APIFormTop
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSave}
        onSend={handleSend}
        isEdit={isEditMode}
        environments={environmentList}
      />

      <div className="bg-white border rounded shadow-sm p-4">
        <RequestTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-4">{renderTab()}</div>
      </div>

      <ResponseViewer
        statusCode={responseData.statusCode}
        response={responseData.content}
        contentType={responseData.contentType}
      />
    </div>
  );
};

export default APIRepositoryDetails;

