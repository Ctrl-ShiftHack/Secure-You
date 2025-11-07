import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nProvider } from "./i18n/index";

// Initialize theme from localStorage on app startup.
try {
	const theme = localStorage.getItem("secureyou_theme");
	if (theme === "dark") document.documentElement.classList.add("dark");
	else document.documentElement.classList.remove("dark");
} catch (e) {
	// ignore
}

createRoot(document.getElementById("root")!).render(
		<I18nProvider>
				<App />
		</I18nProvider>
);
