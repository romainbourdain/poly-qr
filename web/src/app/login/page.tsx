import { LoginForm } from "@/client/components/login/login-form";
import { LoginShell } from "@/client/components/login/login-shell";

export default function LoginPage() {
  return (
    <LoginShell
      title="Accès admin"
      description="Entre le mot de passe de l'espace organisateurs."
    >
      <LoginForm label="Mot de passe admin" submitLabel="Ouvrir l'admin" />
    </LoginShell>
  );
}
