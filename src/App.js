import React from "react";
import "./App.css";
import Nft from "./pages/Admin/NFT/Nft";
import ListNFT from "./pages/Admin/ListNFT/ListNFT";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/Users/Users";
import AdminProperties from "./pages/Admin/Properties/Properties";
import PendingProperties from "./pages/Admin/PendingProperties/PendingProperties";
import AdminMarketplace from "./pages/Admin/Marketplace/Marketplace";
import RevenueReport from "./pages/Admin/Finance/RevenueReport";
import Transactions from "./pages/Admin/Finance/Transactions";
import Payouts from "./pages/Admin/Finance/Payouts";
import SalesAnalytics from "./pages/Admin/Analytics/SalesAnalytics";
import AdminSupport from "./pages/Admin/Support/AdminSupport";
import AIChat from "./pages/AIChat/AIChat";
import Profile from "./pages/Profile/Profile";
import OAuthCallback from "./pages/OAuthCallback/OAuthCallback";
import Properties from "./pages/Properties/Properties";
import MyProperties from "./pages/MyProperties/MyProperties";
import MyDashboard from "./pages/MyDashboard/MyDashboard";
import CreateProperty from "./pages/CreateProperty/CreateProperty";
import EditProperty from "./pages/EditProperty/EditProperty";
import Marketplace from "./pages/Marketplace/Marketplace";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import AIChatWidget from "./components/AIChatWidget/AIChatWidget";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Web3Provider } from "./contexts/GanacheWeb3Context";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-dashboard" element={<MyDashboard />} />
                  <Route path="/my-properties" element={<MyProperties />} />
                  <Route path="/create-property" element={<CreateProperty />} />
                  <Route path="/edit-property/:id" element={<EditProperty />} />
                  <Route path="/properties" element={<Properties />} />

                  {/* Marketplace buy/rent pages (show NFT listings) */}
                  <Route path="/market/buy" element={<Marketplace />} />
                  <Route path="/market/rent" element={<Marketplace />} />

                  {/* Keep /market root redirecting to properties list */}
                  <Route
                    path="/market"
                    element={<Navigate to="/properties" replace />}
                  />

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
                          <AdminProperties />
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
                          <AdminMarketplace />
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
                <AIChatWidget />
              </div>
            </Router>
          </AdminProvider>
        </Web3Provider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
