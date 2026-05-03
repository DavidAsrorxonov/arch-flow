import { dark } from "@clerk/ui/themes";
import type { Appearance } from "@clerk/ui";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorBackground: "var(--bg-surface)",
    colorInput: "var(--bg-subtle)",
    colorInputForeground: "var(--text-primary)",
    colorRing: "var(--accent-primary)",
    colorBorder: "var(--border-default)",
    colorShadow: "var(--bg-base)",
    fontFamily: "var(--font-geist-sans)",
    fontFamilyButtons: "var(--font-geist-sans)",
    borderRadius: "var(--radius)",
  },
} satisfies Appearance;
