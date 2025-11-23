import React from "react";
import "./App.css";
import Nft from "./pages/Admin/NFT/Nft";
import ListNFT from "./pages/Admin/ListNFT/ListNFT";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Properties from "./pages/Admin/Properties/Properties";
import Profile from "./pages/Profile/Profile";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Web3Provider } from "./contexts/Web3Context";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes"; 

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Web3Provider>
          <AdminProvider>
            <Router>
              <div className="App">
                <Routes>
    
                  <Route path="/*" element={<AppRoutes />} />


                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* 🔒 Admin Routes - Protected by todat2207@gmail.com */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Dashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Dashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/nft"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Nft />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/list-nft"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <ListNFT />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Users />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/properties"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Properties />
                        </AdminLayout>
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
