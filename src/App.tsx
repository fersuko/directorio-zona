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
import { useEffect, useState } from "react";

// ... existing imports ...
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log("Current session:", session);

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

export default App;
