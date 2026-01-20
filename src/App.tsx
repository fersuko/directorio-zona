import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";
import PromosPage from "./pages/PromosPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import RegisterBusinessPage from "./pages/RegisterBusinessPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import JoinPage from "./pages/JoinPage";
import FavoritesPage from "./pages/FavoritesPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import InstallPage from "./pages/InstallPage";
import { useEffect } from "react";

import { supabase } from "./lib/supabase";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();

  // Presence logic (Isolating it to depend only on user id)
  useEffect(() => {
    // Fallback for crypto.randomUUID() in non-secure contexts (HTTP over local IP)
    const generateUUID = () => {
      if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      // Fallback for non-secure contexts
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const sessionId = sessionStorage.getItem('analytics_session_id') || generateUUID();
    if (!sessionStorage.getItem('analytics_session_id')) {
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    const presenceChannel = supabase.channel('online_users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        // Optional: Store count in global state if needed
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            session_id: sessionId,
            user_id: user?.id || 'anon'
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user?.id]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<MapPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="promos" element={<PromosPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="register-business" element={<RegisterBusinessPage />} />
          <Route path="business/:id" element={<BusinessDetailPage />} />
          <Route path="unete" element={<JoinPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="instalar" element={<InstallPage />} />
        </Route>

        {/* Rutas de Administración - Sin footer ni chat IA */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="login" element={<AdminLoginPage />} />
        </Route>

        {/* Panel de Dueño - Sin footer */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

import { LocationProvider } from "./context/LocationContext";

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;

