import type { CurrentUser } from "@/lib/auth";
import { shareProps, type ShareKind } from "@/lib/share/data";
import ShareMenu, { type ShareMenuProps } from "./ShareMenu";

/** Server component: monta o link com indicação e o texto, e renderiza o menu de compartilhar. */
export default async function ShareButton({ kind, params, user, label, variant, size }: { kind: ShareKind; params: Record<string, string>; user: CurrentUser | null } & Pick<ShareMenuProps, "label" | "variant" | "size">) {
  const props = await shareProps(kind, params, user);
  if (!props) return null;
  return <ShareMenu {...props} label={label} variant={variant} size={size} />;
}
