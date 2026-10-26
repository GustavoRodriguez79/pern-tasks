import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { buttonClass, cardClass, errorClass, inputClass } from "../components/styles.js";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { user, signin, error, setError } = useAuth();
  const navigate = useNavigate();

  // Limpia un error viejo al entrar a la página.
  useEffect(() => setError(null), [setError]);

  if (user) return <Navigate to="/tasks" replace />;

  const onSubmit = handleSubmit(async (data) => {
    const ok = await signin(data);
    if (ok) navigate("/tasks");
  });

  return (
    <div className={`mx-auto max-w-md ${cardClass}`}>
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>

      {error && <p className="mb-3 rounded-md bg-red-950 p-2 text-sm text-red-300">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            className={inputClass}
            {...register("email", { required: "El email es obligatorio" })}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            className={inputClass}
            {...register("password", { required: "La contraseña es obligatoria" })}
          />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full ${buttonClass}`}>
          Entrar
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="text-sky-400 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
