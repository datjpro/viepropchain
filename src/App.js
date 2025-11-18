import React from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import Nft from "./pages/Admin/NFT/Nft";
import ListNFT from "./pages/Admin/ListNFT/ListNFT";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Properties from "./pages/Admin/Properties/Properties";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Web3Provider } from "./contexts/Web3Context";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Web3Provider>
          <AdminProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />

                  {/* 🔒 Admin Routes - Protected by todat2207@gmail.com */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
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
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/properties"
                    element={
                      <ProtectedRoute>
                        <Properties />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </AdminProvider>
        </Web3Provider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
