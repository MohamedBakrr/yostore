/* eslint-disable react-refresh/only-export-components -- token maps and hooks are part of the theme API. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { read, storageKeys, write } from "../utils/storage";
import { isValidTheme } from "../utils/storage/validators";

const ThemeContext = createContext(null);

/**
 * Token mirrors of `src/styles/main.css`. Kept in JS so the MUI theme (dialogs,
 * drawers, steppers) and the Tailwind/CSS-var theme can never drift apart.
 */
export const THEME_TOKENS = {
    light: {
        paper: "#fbf9f4",
        surface: "#ffffff",
        sunken: "#f2eee5",
        ink: "#17130f",
        inkSoft: "#4e4841",
        muted: "#7b746a",
        hair: "#e5dfd2",
        accent: "#d93f0c",
        accentContrast: "#ffffff",
        success: "#1c6b41",
        danger: "#a5221b",
        warning: "#8a5c00",
    },
    dark: {
        paper: "#12100e",
        surface: "#1a1815",
        sunken: "#0b0a09",
        ink: "#f4f0e8",
        inkSoft: "#c7c0b4",
        muted: "#8f887b",
        hair: "#2b2722",
        accent: "#ff5b24",
        accentContrast: "#17130f",
        success: "#57c189",
        danger: "#f2665f",
        warning: "#e0a53a",
    },
};

function systemTheme() {
    try {
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch {
        return "light";
    }
}

/** Initial theme: inline script value → persisted choice → system preference. */
function initialTheme() {
    const fromDom =
        typeof document !== "undefined"
            ? document.documentElement?.dataset?.theme
            : null;
    if (fromDom === "light" || fromDom === "dark") return fromDom;
    const stored = read(storageKeys.theme, isValidTheme, null);
    return stored ?? systemTheme();
}

export function buildMuiTheme(mode) {
    const t = THEME_TOKENS[mode];
    return createTheme({
        palette: {
            mode,
            primary: { main: t.accent, contrastText: t.accentContrast },
            secondary: { main: t.inkSoft, contrastText: t.paper },
            success: { main: t.success },
            error: { main: t.danger },
            warning: { main: t.warning },
            background: { default: t.paper, paper: t.surface, paperBorder: t.hair },
            text: { primary: t.ink, secondary: t.muted },
            divider: t.hair,
            action: { hover: "rgba(127, 116, 106, 0.08)", selected: "rgba(127, 116, 106, 0.12)" },
        },
        shape: { borderRadius: 4 },
        typography: {
            fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
            button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: "none" },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: { backgroundColor: t.surface, backgroundImage: "none" },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: { backgroundColor: t.surface, backgroundImage: "none" },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: t.ink,
                        color: t.paper,
                        fontSize: "0.75rem",
                    },
                },
            },
        },
    });
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(initialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.dataset.theme = theme;
        write(storageKeys.theme, theme);

        const meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute("content", theme === "dark" ? "#12100e" : "#fbf9f4");
    }, [theme]);

    // Follow the OS only while the user has expressed no explicit choice.
    useEffect(() => {
        let media;
        try {
            media = window.matchMedia?.("(prefers-color-scheme: dark)");
        } catch {
            return undefined;
        }
        if (!media) return undefined;
        const onChange = (event) => {
            if (read(storageKeys.theme, isValidTheme, null) == null) {
                setThemeState(event.matches ? "dark" : "light");
            }
        };
        media.addEventListener?.("change", onChange);
        return () => media.removeEventListener?.("change", onChange);
    }, []);

    const setTheme = useCallback((next) => {
        if (next === "light" || next === "dark") setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) => (current === "dark" ? "light" : "dark"));
    }, []);

    const muiTheme = useMemo(() => buildMuiTheme(theme), [theme]);

    const value = useMemo(
        () => ({ theme, setTheme, toggleTheme, tokens: THEME_TOKENS[theme] }),
        [theme, setTheme, toggleTheme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}
