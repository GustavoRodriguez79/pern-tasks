import { useAuth } from "../context/AuthContext.jsx";
import { cardClass } from "../components/styles.js";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className={`mx-auto max-w-md ${cardClass}`}>
      <h1 className="mb-4 text-2xl font-bold">Mi perfil</h1>
      <div className="flex items-center gap-4">
        {/* Avatar de Gravatar generado en el backend con md5(email) */}
        <img
          src={`${user.gravatar}?d=identicon&s=96`}
          alt={`Avatar de ${user.name}`}
          className="h-24 w-24 rounded-full border border-zinc-700"
        />
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-zinc-400">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
