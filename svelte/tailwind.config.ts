import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/**/*"
    ],
    theme: {
        extend: {
            backgroundImage: {
                check: "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
            },
            colors: {
                primary: "#888888",
                foreground: "rgb(var(--color-foreground) / <alpha-value>)",
                background: "rgb(var(--color-background) / <alpha-value>)",
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
                shade: "rgb(var(--color-shade) / <alpha-value>)"
            },
            spacing: {
                "11/25": "44%",
                "14/25": "56%"
            },
            transitionTimingFunction: {
                "quint-out": "cubic-bezier(0.22, 1, 0.36, 1)"
            }
        }
    },
    plugins: []
} satisfies Config