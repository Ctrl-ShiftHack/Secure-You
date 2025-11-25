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

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js')
			.then((registration) => {
				// Check for updates periodically
				setInterval(() => {
					registration.update();
				}, 60000); // Check every minute
			})
			.catch((error) => {
				if (import.meta.env.DEV) {
					console.error('❌ Service Worker registration failed:', error);
				}
			});
	});
}

// Request notification permission for PWA
if ('Notification' in window && import.meta.env.PROD) {
	if (Notification.permission === 'default') {
		// Request permission after user interaction (not immediately)
		setTimeout(() => {
			Notification.requestPermission();
		}, 5000); // Wait 5 seconds before asking
	}
}

// Add error boundary
window.addEventListener('error', (event) => {
	if (import.meta.env.DEV) {
		console.error('Global error:', event.error);
	}
});

window.addEventListener('unhandledrejection', (event) => {
	if (import.meta.env.DEV) {
		console.error('Unhandled promise rejection:', event.reason);
	}
});

// Add a loading indicator first
document.getElementById("root")!.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;"><div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 10px;">🔄</div><p>Loading App...</p></div></div>';

setTimeout(() => {
	try {
		const rootElement = document.getElementById("root");
		if (!rootElement) {
			throw new Error('Root element not found');
		}
		
		if (import.meta.env.DEV) {
			console.log('🚀 Mounting React app...');
			console.log('Environment check:', {
				supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗',
				supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗'
			});
		}
		
		createRoot(rootElement).render(
			<I18nProvider>
				<App />
			</I18nProvider>
		);
		
		if (import.meta.env.DEV) {
			console.log('✅ App mounted successfully');
		}
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error('❌ Failed to mount app:', error);
		}
		const rootElement = document.getElementById("root");
		if (rootElement) {
			rootElement.innerHTML = `
				<div style="padding: 20px; font-family: system-ui; max-width: 600px; margin: 50px auto; border: 2px solid red; border-radius: 8px; background: #fee;">
					<h1 style="color: red;">⚠️ App Failed to Load</h1>
					<p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
					<p><strong>Stack:</strong></p>
					<pre style="background: white; padding: 10px; overflow: auto;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
					<button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
				</div>
			`;
		}
	}
}, 100);
