"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Button } from "@/client/components/ui/button";
import { TextField } from "@/client/components/ui/text-field";
import { EVENT } from "@/shared/mock/event";
import { loginSchema } from "@/shared/validators/login";

export function LoginForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { password: "" },
    validators: {
      onChange: loginSchema,
      onSubmit: ({ value }) =>
        value.password === EVENT.motDePasse
          ? undefined
          : { fields: { password: "Mot de passe incorrect." } },
    },
    onSubmit: ({ value }) => {
      if (value.password === EVENT.motDePasse) router.push("/scanner");
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
            placeholder="hangar2026"
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
