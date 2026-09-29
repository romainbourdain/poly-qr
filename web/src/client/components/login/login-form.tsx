"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Button } from "@/client/components/ui/button";
import { TextField } from "@/client/components/ui/text-field";
import { login } from "@/server/actions/auth";
import { actionErrorsToForm } from "@/shared/lib/form-errors";
import { loginSchema } from "@/shared/validators/login";

export function LoginForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { password: "" },
    validators: {
      onChange: loginSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await login(value);
        if (result?.data?.success) return undefined;
        const { form, fields } = actionErrorsToForm(result);
        // Le formulaire n'affiche que l'erreur du champ : y rattacher l'erreur serveur.
        return { fields: { password: fields.password ?? form } };
      },
    },
    onSubmit: () => {
      router.push("/scanner");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-3.5"
    >
      <form.Field name="password">
        {(field) => (
          <TextField
            field={field}
            label="Mot de passe de la soirée"
            type="password"
            autoComplete="current-password"
            className="h-13.5 font-mono text-[17px] tracking-wider"
          />
        )}
      </form.Field>
      <Button type="submit" className="h-13.5 text-[16px]">
        Ouvrir le scanner
      </Button>
    </form>
  );
}
