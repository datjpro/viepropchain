import React from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import Nft from "./pages/Admin/NFT/Nft";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/nft" element={<Nft />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
