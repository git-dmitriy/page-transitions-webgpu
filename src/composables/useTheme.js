const STORAGE_KEY = "theme";

export function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

export function setTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
}

export function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved === "dark" || saved === "light" ? saved : "light");
}
