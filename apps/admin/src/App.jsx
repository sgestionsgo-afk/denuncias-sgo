// App.jsx — Admin: Panel directo sin autenticación
import React from "react";
import Dashboard from "./components/Dashboard";
import { GOOGLE_SCRIPT_URL, API_KEY } from "./config/api";

function App() {
  return <Dashboard scriptUrl={GOOGLE_SCRIPT_URL} apiKey={API_KEY} />;
}

export default App;
