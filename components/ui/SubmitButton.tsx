"use client";

import { useFormStatus } from "react-dom";
import Button from "./Button";
import type { ComponentProps } from "react";

export default function SubmitButton({ children, pendingText = "Aguarde…", ...props }: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? pendingText : children}
    </Button>
  );
}
