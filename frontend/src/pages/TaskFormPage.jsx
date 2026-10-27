import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createTaskRequest, getTaskRequest, updateTaskRequest } from "../api/tasks.js";
import { useAuth } from "../context/AuthContext.jsx";
import { buttonClass, cardClass, errorClass, inputClass } from "../components/styles.js";

// Sirve para crear (/tasks/new) y para editar (/tasks/:id/edit).
export default function TaskFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { getErrorMessage } = useAuth();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // En modo edición, cargamos la tarea y rellenamos el formulario.
  useEffect(() => {
    if (!isEditing) return;
    getTaskRequest(id)
      .then((res) => reset({ title: res.data.title, description: res.data.description ?? "" }))
      .catch(() => setServerError("No se encontró la tarea"));
  }, [id, isEditing, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      if (isEditing) await updateTaskRequest(id, data);
      else await createTaskRequest(data);
      navigate("/tasks");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  });

  return (
    <div className={`mx-auto max-w-lg ${cardClass}`}>
      <h1 className="mb-4 text-2xl font-bold">{isEditing ? "Editar tarea" : "Nueva tarea"}</h1>

      {serverError && (
        <p className="mb-3 rounded-md bg-red-950 p-2 text-sm text-red-300">{serverError}</p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            placeholder="Título"
            className={inputClass}
            {...register("title", { required: "El título es obligatorio" })}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        <textarea
          rows={4}
          placeholder="Descripción (opcional)"
          className={inputClass}
          {...register("description")}
        />

        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isEditing ? "Guardar cambios" : "Crear tarea"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="rounded-md bg-zinc-700 px-4 py-2 hover:bg-zinc-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
