import { createContext, useContext, useEffect, useState } from "react";
import {
  signinRequest,
  signoutRequest,
  signupRequest,
  profileRequest,
} from "../api/auth.js";

// Context: guarda el usuario logueado y lo comparte con toda la app.
const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};

// Convierte un error de Axios en un mensaje legible.
const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.mensaje).join(". ");
  return data?.message || "No se pudo conectar con el servidor";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Al abrir la app preguntamos si ya hay una sesión (cookie) válida.
  useEffect(() => {
    profileRequest()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = async (data) => {
    setError(null);
    try {
      const res = await signupRequest(data);
      setUser(res.data);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const signin = async (data) => {
    setError(null);
    try {
      const res = await signinRequest(data);
      setUser(res.data);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const signout = async () => {
    await signoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, setError, signup, signin, signout, getErrorMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}
