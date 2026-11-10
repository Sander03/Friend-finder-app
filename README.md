<a id="readme-top"></a>

<br />
<div align="center">
  <img src="public/icons/icon-192.png" alt="Logo" width="80" height="80">

  <h3 align="center">Waarbenje</h3>

  <p align="center">
    Vind je vrienden terug, waar je ook bent: in het park, op het strand of op een festival.
    <br />
    <a href="https://friend-finder-app-53z9.vercel.app"><strong>Open de PWA »</strong></a>
  </p>
</div>

<details>
  <summary>Inhoud</summary>
  <ol>
    <li><a href="#over-het-project">Over het project</a></li>
    <li><a href="#inloggen">Inloggen</a></li>
    <li><a href="#gebouwd-met">Gebouwd met</a></li>
    <li><a href="#lokaal-draaien">Lokaal draaien</a></li>
    <li><a href="#het-idee">Het idee</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## Over het project

Op een festival, in een vol park of op een druk strand raak je je vrienden snel kwijt. **Waarbenje** toont je vrienden op een plattegrond rond jou, met de afstand en de richting. Je maakt een groep, deelt de code en iedereen in de groep ziet elkaar. Een groep stopt automatisch na 24 uur.

**Publieke link:** [https://friend-finder-app-53z9.vercel.app](https://friend-finder-app-53z9.vercel.app)

| Scherm | Wat het doet |
| --- | --- |
| **Aanmelden** | Aanmelden of een account maken. |
| **Start** | Je actieve groep, al je groepen en snelkoppelingen. |
| **Kaart** | Radar of echte kaart met je vrienden, plus een lijst met afstand. |
| **Vriend zoeken** | Pijl naar je vriend met de afstand. |
| **Flash** | Je scherm knippert in een felle kleur, zodat je vriend je ziet. |
| **Groep** | Groepscode en leden bekijken, groep verlaten. |
| **Groep toevoegen** | Een groep maken of meedoen met een code. |
| **Instellingen** | Profiel en afmelden. |

> Deze versie gebruikt nog geen native features (zoals GPS). In de demo-groep **De Bende** sta je daarom op een vaste plek, zodat de kaart altijd werkt.

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Inloggen

| | |
| --- | --- |
| E-mail | `niels@gmail.com` |
| Wachtwoord | `niels01` |

Dit account zit in de demo-groep **De Bende** met vier vrienden.

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Gebouwd met

* [Expo](https://expo.dev) en Expo Router (UCLL-boilerplate)
* [Supabase](https://supabase.com): database, login en live updates
* [Leaflet](https://leafletjs.com) met OpenStreetMap voor de kaart
* [Vercel](https://vercel.com) voor de hosting van de PWA

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Lokaal draaien

1. Voer [`supabase/schema.sql`](supabase/schema.sql) uit in de SQL Editor van je Supabase-project.
2. Maak een bestand `.env` in de hoofdmap:

   ```sh
   EXPO_PUBLIC_SUPABASE_URL=https://<jouw-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<jouw anon key>
   ```

3. Start de app:

   ```sh
   npm install
   npm run web
   ```

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Het idee

### Doelgroep

Jongeren van 16 tot 30 jaar die in groep op stap gaan: naar een festival, het strand, het park of een stadsfeest. Ze willen snel zien waar iedereen is, zonder hun locatie voor altijd te delen.

### Roadmap

**Fase 1: PWA (deze versie)**

- [x] Aanmelden en registreren
- [x] Groep maken of meedoen met een code
- [x] Radar en kaart met je vrienden
- [x] Vriend zoeken met richting en afstand
- [x] Flash-scherm
- [x] Groep stopt automatisch na 24 uur
- [x] Installeerbaar als PWA

**Fase 2: native features**

- [ ] Je eigen locatie live delen (GPS)
- [ ] Het scherm aan laten tijdens het zoeken
- [ ] De groepscode delen via het deelmenu van je gsm

**Fase 3: native app**

- [ ] Kompas dat meedraait met je gsm
- [ ] Locatie delen op de achtergrond
- [ ] Pushmeldingen

### Concurrenten

| App | Verschil met Waarbenje |
| --- | --- |
| **Apple Zoek mijn** | Alleen voor iPhone, en je deelt permanent in plaats van tijdelijk per groep. |
| **Google Maps locatie delen** | Je deelt per persoon, zonder groepsoverzicht. |
| **WhatsApp live locatie** | Per chat, zonder afstand of richting. |
| **Life360** | Gemaakt om permanent te volgen, niet voor een dag uit. |

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Contact

Sander Hostyn: [https://github.com/Sander03/Friend-finder-app](https://github.com/Sander03/Friend-finder-app)

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>
