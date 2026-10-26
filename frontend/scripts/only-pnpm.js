// Bloquea la instalación si no se usa pnpm.
const agent = process.env.npm_config_user_agent || "";
if (!agent.startsWith("pnpm/")) {
  console.error("\n⛔ Este proyecto usa pnpm. No uses npm ni yarn.");
  console.error("   Activá pnpm con:   corepack enable");
  console.error("   Luego ejecutá:     pnpm install\n");
  process.exit(1);
}
