import React from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import TestPage from "./pages/Test/pagetest";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
