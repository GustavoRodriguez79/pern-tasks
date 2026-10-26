import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-zinc-400">La página que buscás no existe.</p>
      <Link to="/" className="mt-4 inline-block text-sky-400 hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
