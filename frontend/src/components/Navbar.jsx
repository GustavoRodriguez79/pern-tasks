import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `px-3 py-1 rounded-md ${isActive ? "bg-zinc-700 text-white" : "text-zinc-300 hover:text-white"}`;

export default function Navbar() {
  const { user, signout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
      <Link to="/" className="text-lg font-bold text-white">
        PERN Tasks
      </Link>

      <ul className="flex items-center gap-1 text-sm">
        {user ? (
          <>
            <li>
              <NavLink to="/tasks" end className={linkClass}>
                Mis tareas
              </NavLink>
            </li>
            <li>
              <NavLink to="/tasks/new" className={linkClass}>
                Nueva tarea
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={linkClass}>
                {user.name}
              </NavLink>
            </li>
            <li>
              <button
                onClick={signout}
                className="rounded-md bg-zinc-700 px-3 py-1 text-white hover:bg-zinc-600"
              >
                Salir
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
