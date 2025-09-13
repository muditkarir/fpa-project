
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ScenarioAnalysis from "./pages/ScenarioAnalysis";
import Insights from "./pages/Insights";
import DataSources from "./pages/DataSources";
import About from "./pages/About";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scenario" element={<ScenarioAnalysis />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/sources" element={<DataSources />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
