import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Workspace />
      </div>
    </div>
  );
}

export default App;
