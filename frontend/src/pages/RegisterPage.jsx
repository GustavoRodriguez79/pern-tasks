import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { buttonClass, cardClass, errorClass, inputClass } from "../components/styles.js";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { user, signup, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => setError(null), [setError]);

  if (user) return <Navigate to="/tasks" replace />;

  const onSubmit = handleSubmit(async (data) => {
    const ok = await signup(data);
    if (ok) navigate("/tasks");
  });

  return (
    <div className={`mx-auto max-w-md ${cardClass}`}>
      <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>

      {error && <p className="mb-3 rounded-md bg-red-950 p-2 text-sm text-red-300">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            placeholder="Nombre"
            className={inputClass}
            {...register("name", {
              required: "El nombre es obligatorio",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
            })}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

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
            placeholder="Contraseña (mínimo 6 caracteres)"
            className={inputClass}
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
            })}
          />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full ${buttonClass}`}>
          Registrarme
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="text-sky-400 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
