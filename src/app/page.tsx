import { Accordion, AccordionGroup, AccordionDetails, AccordionSummary, Stack, Typography, Link, List, ListItem } from "@mui/joy";

export default function Home() {
	return (
		<Stack gap={3} sx={{ px: 4, py: 3 }}>
			<Typography level="h3">Jakub Ratajczyk</Typography>
			<Typography level="h3">Ivan Haidov</Typography>
			<Typography level="h4">
				System wspomagający pozyskiwanie wymagań pozafunkcjonalnych na podstawie szablonów z wykorzystaniem walidatora AI
			</Typography>

			<AccordionGroup sx={{ maxWidth: 800 }}>
				<Accordion defaultExpanded>
					<AccordionSummary>
						<Typography level="title-md">Opis aplikacji</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography level="body-md">
							Aplikacja umożliwia użytkownikowi tworzenie wymagań pozafunkcjonalnych w oparciu o zdefiniowane szablony lub w sposób niestandardowy.
							System wspiera proces walidacji jakości wymagań z wykorzystaniem modelu AI (ChatGPT), który ocenia ich jednoznaczność, mierzalność i kompletność indywidualną. 
							Ponadto użytkownik może przejrzeć historię walidacji oraz przekazać informację zwrotną dotyczącą sugestii AI.
						</Typography>

						<Typography level="body-md" sx={{ mt: 2 }}>
							Główne funkcjonalności aplikacji obejmują:
						</Typography>
						<List sx={{ listStyleType: 'disc', pl: 3 }}>
							<ListItem><strong>Kreator wymagań:</strong> interfejs umożliwiający wypełnianie szablonów lub tworzenie własnych wymagań pozafunkcjonalnych.</ListItem>
							<ListItem><strong>Weryfikacja AI:</strong> możliwość wysłania wymagania do modelu AI w celu oceny jakości z opcją przeglądu sugestii i ocen.</ListItem>
							<ListItem><strong>Historia walidacji:</strong> strona z tabelarycznym widokiem wszystkich wcześniej zweryfikowanych wymagań wraz z ocenami i datą.</ListItem>
							<ListItem><strong>Szczegóły walidacji:</strong> ekran prezentujący szczegółowe wyniki analizy AI, sugerowaną poprawioną wersję oraz możliwość oceny sugestii przez użytkownika.</ListItem>
							<ListItem><strong>Przegląd szablonów:</strong> możliwość przeglądania dostępnych szablonów wymagań według kategorii i podkategorii.</ListItem>
							<ListItem><strong>Wsadowa walidacja:</strong> funkcjonalność umożliwiająca przesłanie pliku JSON z wymaganiami do masowej walidacji przez AI.</ListItem>
							<ListItem><strong>Opcje administracyjne:</strong> możliwość wczytywania niestandardowych szablonów oraz opisów systemów w celu dostosowania środowiska walidacji.</ListItem>
						</List>
					</AccordionDetails>
				</Accordion>

				<Accordion>
					<AccordionSummary>
						<Typography level="title-md">Informacje o eksperymencie</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography level="body-md" sx={{ mb: 1 }}>
							Eksperyment został przeprowadzony w kontekście systemu StudentDeal. Celem było zbadanie wpływu szablonów i opisu systemu na jakość generowanych wymagań.
						</Typography>
						<List sx={{ pl: 2, listStyleType: 'circle' }}>
							<ListItem>
								<Link
									href="https://forms.gle/J2wBoijZkGq5pMjZ6"
									target="_blank"
									underline="hover"
									color="primary"
								>
								{">"} Formularz oceny eksperymentu
								</Link>
							</ListItem>
							<ListItem>
								<Link
									href="https://www.canva.com/design/DAGqi_9v2h4/Bml2OIY_Chf_vGg5MWt01g/edit?utm_content=DAGqi_9v2h4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" // replace with actual video
									target="_blank"
									underline="hover"
									color="primary"
								>
								{">"} Prezentacja eksperymentu
								</Link>
							</ListItem>
							<ListItem>
								<Link
									href="https://docs.google.com/document/d/1GCX0I2DiiWjkBN4saEZvdrt7R6rH5CIz/edit?usp=sharing&ouid=110477775801055175546&rtpof=true&sd=true" // ensure this file exists in your public folder
									underline="hover"
									color="primary"
								>
								{">"} Opis systemu StudentDeal 
								</Link>
							</ListItem>
						</List>
					</AccordionDetails>
				</Accordion>
			</AccordionGroup>
		</Stack>
	);
}
