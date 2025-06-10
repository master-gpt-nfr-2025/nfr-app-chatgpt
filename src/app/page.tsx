import { Stack, Typography } from "@mui/joy";

export default function Home() {
	return (
		<Stack gap={2}>
			<Typography level="h3">Jakub Ratajczyk</Typography>
			<Typography level="h3">Ivan Haidov</Typography>
			<Typography level="h4">
				System wspomagający pozyskiwanie wymagań pozafunkcjonalnych na podstawie szablonów z wykorzystaniem walidatora AI
			</Typography>

			<Typography level="body-md" sx={{ maxWidth: 800 }}>
				Aplikacja umożliwia użytkownikowi tworzenie wymagań pozafunkcjonalnych w oparciu o zdefiniowane szablony lub w sposób niestandardowy.
				System wspiera proces walidacji jakości wymagań z wykorzystaniem modelu AI (ChatGPT), który ocenia ich jednoznaczność, mierzalność i kompletność indywidualną. 
				Ponadto użytkownik może przejrzeć historię walidacji oraz przekazać informację zwrotną dotyczącą sugestii AI.
			</Typography>

			<Typography level="body-md" sx={{ maxWidth: 800 }}>
				Główne funkcjonalności aplikacji obejmują:
			</Typography>

			<ul style={{ maxWidth: 800, paddingLeft: "1.5rem", marginTop: 0 }}>
				<li><strong>Kreator wymagań:</strong> interfejs umożliwiający wypełnianie szablonów lub tworzenie własnych wymagań pozafunkcjonalnych.</li>
				<li><strong>Weryfikacja AI:</strong> możliwość wysłania wymagania do modelu AI w celu oceny jakości z opcją przeglądu sugestii i ocen.</li>
				<li><strong>Historia walidacji:</strong> strona z tabelarycznym widokiem wszystkich wcześniej zweryfikowanych wymagań wraz z ocenami i datą.</li>
				<li><strong>Szczegóły walidacji:</strong> ekran prezentujący szczegółowe wyniki analizy AI, sugerowaną poprawioną wersję oraz możliwość oceny sugestii przez użytkownika.</li>
				<li><strong>Przegląd szablonów:</strong> możliwość przeglądania dostępnych szablonów wymagań według kategorii i podkategorii.</li>
				<li><strong>Wsadowa walidacja:</strong> funkcjonalność umożliwiająca przesłanie pliku JSON z wymaganiami do masowej walidacji przez AI.</li>
				<li><strong>Opcje administracyjne:</strong> możliwość wczytywania niestandardowych szablonów oraz opisów systemów w celu dostosowania środowiska walidacji.</li>
			</ul>
		</Stack>
	);
}
