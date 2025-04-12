import React from "react";

const RequestTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["Headers", "Authorization", "Body", "Query Params"];

  return (
    <div className="border-b border-gray-200 px-2">
      <div className="flex space-x-6 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 transition-colors ${
              activeTab === tab
                ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                : "text-gray-500 border-b-2 border-transparent hover:text-[#4F46E5]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RequestTabs;
