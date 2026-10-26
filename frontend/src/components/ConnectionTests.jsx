import { useEffect, useState } from "react";
import { pingRequest, dbRequest } from "../api/auth.js";

const tests = [
  { id: "api", label: "React → Express (proxy + CORS)", run: pingRequest },
  { id: "db", label: "React → Express → PostgreSQL", run: dbRequest },
];

export default function ConnectionTests() {
  const [results, setResults] = useState({});

  const runAll = async () => {
    setResults({});
    for (const t of tests) {
      try {
        const res = await t.run();
        setResults((r) => ({ ...r, [t.id]: { ok: true, msg: res.data.message } }));
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        setResults((r) => ({ ...r, [t.id]: { ok: false, msg } }));
      }
    }
  };

  useEffect(() => {
    runAll();
  }, []);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tests de conexión</h2>
        <button
          onClick={runAll}
          className="rounded-md bg-zinc-700 px-3 py-1 text-sm hover:bg-zinc-600"
        >
          Repetir
        </button>
      </div>
      <ul className="space-y-2 text-sm">
        {tests.map((t) => {
          const r = results[t.id];
          return (
            <li key={t.id} className="flex flex-wrap items-baseline gap-2">
              <span>{r ? (r.ok ? "✅" : "❌") : "⏳"}</span>
              <strong>{t.label}</strong>
              {r && <small className={r.ok ? "text-green-400" : "text-red-400"}>{r.msg}</small>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
