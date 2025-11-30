import React from "react";
import "./App.css";
import Nft from "./pages/Admin/NFT/Nft";
import ListNFT from "./pages/Admin/ListNFT/ListNFT";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import Properties from "./pages/Admin/Properties/Properties";
import PendingProperties from "./pages/Admin/PendingProperties/PendingProperties";
import Marketplace from "./pages/Admin/Marketplace/Marketplace";
import RevenueReport from "./pages/Admin/Finance/RevenueReport";
import Transactions from "./pages/Admin/Finance/Transactions";
import Payouts from "./pages/Admin/Finance/Payouts";
import SalesAnalytics from "./pages/Admin/Analytics/SalesAnalytics";
import AdminSupport from "./pages/Admin/Support/AdminSupport";
import Profile from "./pages/Profile/Profile";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import ChatWidget from "./components/ChatWidget/ChatWidget";
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
                  <Route
                    path="/admin/pending"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <PendingProperties />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/marketplace"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Marketplace />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Finance Routes */}
                  <Route
                    path="/admin/finance/revenue"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <RevenueReport />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/finance/transactions"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Transactions />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/finance/payouts"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Payouts />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Analytics Routes */}
                  <Route
                    path="/admin/analytics/sales"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <SalesAnalytics />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Chat Routes */}
                  <Route
                    path="/admin/support"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <AdminSupport />
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <ChatWidget />
              </div>
            </Router>
          </AdminProvider>
        </Web3Provider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
