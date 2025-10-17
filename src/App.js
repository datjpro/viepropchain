import React from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import Nft from "./pages/Admin/NFT/Nft";
import ListNFT from "./pages/Admin/ListNFT/ListNFT";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Web3Provider } from "./contexts/Web3Context";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <Web3Provider>
        <AdminProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/admin/nft"
                  element={
                    <ProtectedRoute>
                      <Nft />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/list-nft"
                  element={
                    <ProtectedRoute>
                      <ListNFT />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AdminProvider>
      </Web3Provider>
    </LanguageProvider>
  );
}

export default App;
