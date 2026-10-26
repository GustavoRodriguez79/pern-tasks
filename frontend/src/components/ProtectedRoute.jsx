import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Si no hay sesión, redirige al login. Si la hay, muestra la página hija.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6 text-zinc-400">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
