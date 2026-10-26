import { Link } from "react-router-dom";
import ConnectionTests from "../components/ConnectionTests.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { cardClass } from "../components/styles.js";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <section className={cardClass}>
        <h1 className="text-2xl font-bold">PERN Stack</h1>
        <p className="mt-1 text-zinc-400">PostgreSQL · Express · React · Node</p>
        <p className="mt-4">
          {user ? (
            <Link to="/tasks" className="text-sky-400 hover:underline">
              Ir a mis tareas →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sky-400 hover:underline">
                Ingresá
              </Link>{" "}
              o{" "}
              <Link to="/register" className="text-sky-400 hover:underline">
                creá una cuenta
              </Link>{" "}
              para empezar.
            </>
          )}
        </p>
      </section>

      <ConnectionTests />
    </div>
  );
}
