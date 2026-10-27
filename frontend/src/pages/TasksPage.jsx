import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTaskRequest, getTasksRequest, updateTaskRequest } from "../api/tasks.js";
import { cardClass } from "../components/styles.js";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getTasksRequest();
      setTasks(res.data);
    } catch {
      setError("No se pudieron cargar las tareas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (task) => {
    await updateTaskRequest(task.id, { done: !task.done });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await deleteTaskRequest(id);
    load();
  };

  if (loading) return <p className="text-zinc-400">Cargando tareas…</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis tareas</h1>
        <Link to="/tasks/new" className="rounded-md bg-sky-600 px-3 py-1.5 text-sm hover:bg-sky-500">
          Nueva tarea
        </Link>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {tasks.length === 0 && !error && (
        <p className={`${cardClass} text-zinc-400`}>Todavía no tenés tareas. ¡Creá la primera!</p>
      )}

      {tasks.map((task) => (
        <article key={task.id} className={`${cardClass} flex items-start justify-between gap-4`}>
          <label className="flex flex-1 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggle(task)}
              className="mt-1.5 h-4 w-4"
            />
            <span>
              <span className={`block font-medium ${task.done ? "text-zinc-500 line-through" : ""}`}>
                {task.title}
              </span>
              {task.description && (
                <span className="block text-sm text-zinc-400">{task.description}</span>
              )}
            </span>
          </label>

          <div className="flex gap-2 text-sm">
            <Link
              to={`/tasks/${task.id}/edit`}
              className="rounded-md bg-zinc-700 px-3 py-1 hover:bg-zinc-600"
            >
              Editar
            </Link>
            <button
              onClick={() => remove(task.id)}
              className="rounded-md bg-red-700 px-3 py-1 hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
