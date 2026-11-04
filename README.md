<a id="readme-top"></a>

<br />
<div align="center">
  <img src="public/icons/icon-192.png" alt="Logo" width="80" height="80">

  <h3 align="center">Waarbenje</h3>

  <p align="center">
    Vind je vrienden terug, waar je ook bent: in het park, op het strand of op een festival.
    <br />
    <a href="[PUBLIEKE-LINK]"><strong>Open de PWA »</strong></a>
  </p>
</div>

<details>
  <summary>Inhoud</summary>
  <ol>
    <li><a href="#over-het-project">Over het project</a></li>
    <li><a href="#inloggen-voor-de-docent">Inloggen (voor de docent)</a></li>
    <li><a href="#gebouwd-met">Gebouwd met</a></li>
    <li><a href="#aan-de-slag">Aan de slag</a></li>
    <li><a href="#het-idee">Het idee: doelgroep, roadmap en concurrenten</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## Over het project

In een vol park, op een druk strand of op een festival raak je je vrienden snel kwijt, en "ik zit bij de grote boom" of "ik sta aan de bar" zegt weinig. **Waarbenje** toont je vrienden op een plattegrond rond jou, met de afstand en de richting. Werkt overal: je maakt een groep, deelt de code en iedereen ziet elkaar. Op een festival met herkenningspunten (Main Stage, Food court, ...) zie je ook bij welk punt je vriend staat. Ben je vlakbij maar zie je elkaar nog niet? Dan laat je je scherm in een felle kleur knipperen.

**Publieke link:** [PUBLIEKE-LINK]

Schermen in deze versie:

| Scherm | Wat het doet |
| --- | --- |
| **Aanmelden** (`/login`) | Aanmelden of een account maken (Supabase Auth). |
| **Start** (`/`) | Startpagina: je actieve groep met wie er live is, al je groepen (tik om te wisselen) en snelkoppelingen om een groep te maken, een code in te voeren of vrienden uit te nodigen. |
| **Kaart** (`/map`) | Schakel tussen een radar (jou in het midden, je vrienden rondom) en een echte OpenStreetMap-kaart. Tik op een vriend om die te zoeken. Eronder staat een lijst met afstand en "laatst gezien". Locaties komen live binnen (Supabase Realtime). |
| **Vriend zoeken** (`/friend`) | Kompasroos met een pijl naar je vriend, afstand, herkenningspunt en bericht. |
| **Flash** (`/flash`) | Knippert in de kleur van je vriend, zodat die je in de menigte ziet. |
| **Groep** (`/group`) | Groepscode delen, leden bekijken, groep verlaten. |
| **Groep toevoegen** (`/new`) | Een nieuwe groep maken (voor eender welke plek) of meedoen met een code. |
| **Instellingen** (`/settings`) | Profiel, locatie meteen delen aan/uit, scherm aan laten, privacy-uitleg, afmelden. |

Privacy zit in het ontwerp: je locatie is alleen zichtbaar voor je groep, en het delen stopt automatisch: een nieuwe groep vervalt na 24 uur (afgedwongen met Row Level Security in de database).

> **Demo-modus:** elk nieuw account zit meteen in de demo-groep **De Bende** (code `BENDE1`) op een festivalterrein. Ben je daar niet in de buurt (meer dan 3 km) of geef je geen toegang tot je locatie, dan zet de app je op een vaste plek op dat terrein, zodat je de demo altijd ziet werken. Groepen die je zelf maakt, gebruiken altijd je echte locatie, waar je ook bent.

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Inloggen (voor de docent)

| | |
| --- | --- |
| E-mail | `[TEST-EMAIL]` |
| Wachtwoord | `[TEST-WACHTWOORD]` |

Dit testaccount zit in de demo-groep **De Bende** (code `BENDE1`) met vier vrienden. Een nieuw account maken kan ook: elk nieuw account komt automatisch in de demo-groep.

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Gebouwd met

* [Expo](https://expo.dev) (SDK 52) en [Expo Router](https://docs.expo.dev/router/introduction/), vertrokken van de UCLL-boilerplate
* React Native en React Native Web
* [Supabase](https://supabase.com): Postgres-database, Auth en Realtime (gehost)
* [Zustand](https://zustand-demo.pmnd.rs) voor de state
* [Leaflet](https://leafletjs.com) met [OpenStreetMap](https://www.openstreetmap.org)-tegels voor de echte kaart, net als in de cursusdemo [pwa-locate-me](https://github.com/UCLL-Mobile-Applications-demos/pwa-locate-me)
* De Geolocation-API van de browser (`navigator.geolocation.watchPosition`) om je locatie live te volgen
* `expo-location` (in de browser: de Geolocation API)
* Gehost op [Vercel](https://vercel.com) als PWA (manifest + service worker)

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Aan de slag

### Vereisten

* Node.js 20 of nieuwer
* Een (gratis) Supabase-project

### Database opzetten

1. Maak een project op [supabase.com](https://supabase.com).
2. Open **SQL Editor**, plak de inhoud van [`supabase/schema.sql`](supabase/schema.sql) en klik op **Run**. Dit maakt de tabellen, de beveiliging, realtime en de demo-groep aan. Had je `schema.sql` al eerder uitgevoerd? Voer dan enkel [`supabase/update-overal.sql`](supabase/update-overal.sql) uit.
3. Maak een testaccount: **Authentication > Users > Add user**, vink *Auto Confirm User* aan.

### Lokaal draaien

```sh
npm install
cp .env.example .env   # vul de Supabase-URL en de anon/publishable key in
npm run web            # opent op http://localhost:8081
```

### PWA bouwen

```sh
npm run build:web      # maakt de map dist/
npm run serve:web      # test de gebouwde versie op http://localhost:8081
```

Op je gsm: open de link in Chrome (Android) of Safari (iOS) en kies **Toevoegen aan beginscherm**.

### Deployen op Vercel

Importeer de GitHub-repo in Vercel. `vercel.json` bevat de build-instellingen. Voeg onder **Settings > Environment Variables** `EXPO_PUBLIC_SUPABASE_URL` en `EXPO_PUBLIC_SUPABASE_ANON_KEY` toe en deploy opnieuw.

### Testen

```sh
npm run typecheck
npx cypress run --env email=[TEST-EMAIL],password=[TEST-WACHTWOORD]   # met de app op poort 8081
npm run storybook   # componenten bekijken
```

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Het idee

### Doelgroep

* **Jongeren van 16 tot 30 jaar** die in groep op stap gaan: een dag naar het strand, picknicken in het park, een festival of concert, een stadsfeest.
* Ook bruikbaar voor **schooluitstappen, jeugdbewegingen en families op uitstap**: elke situatie waar een groep tijdelijk samen is en elkaar uit het oog verliest.

Wat ze nodig hebben: snel zien waar iedereen is, zonder hun locatie voor altijd met iedereen te delen.

### Wat ik ga bouwen (roadmap)

- [x] **PWA (deze versie):** aanmelden, groep met code, live plattegrond rond jezelf, vriend zoeken met richting en afstand, flash-scherm, zelf een groep maken voor eender welke plek, automatisch stoppen na 24 uur.
- [ ] **Foto-pin "Ik sta hier":** een foto van wat je ziet (een vlag, een kraam) met een korte tekst, en verzamelpunten.
- [ ] **Echte kaart van het terrein:** plattegronden en podia per evenement, offline beschikbaar.
- [ ] **Native app (Expo dev build):** kompas dat meedraait met je gsm, locatie op de achtergrond, pushmeldingen ("Lotte vraagt om te flashen").
- [ ] **Bluetooth in de buurt:** "binnen ~10 m" voor de laatste meters, ook zonder internet.
- [ ] **Offline:** laatst bekende locaties en pins bewaren voor als het netwerk overbelast is.

### Concurrenten

| App | Wat ze goed doen | Waar Waarbenje anders is |
| --- | --- | --- |
| **Apple Zoek mijn / Find My** | Nauwkeurig, ingebouwd op iPhone | Alleen Apple, en delen is permanent en per persoon in plaats van tijdelijk per groep |
| **Google Maps locatie delen** | Werkt op Android en iOS | Algemene kaart zonder podia of herkenningspunten; delen per persoon |
| **WhatsApp live locatie** | Iedereen heeft het al | Per chat en maximaal 8 uur; geen afstand, richting of groepsoverzicht |
| **Life360** | Gemaakt voor families | Gericht op permanent volgen en veiligheid, niet op een avond uit |
| **Snap Map** | Populair bij jongeren | Openbaar of semi-openbaar, niet gemaakt om iemand terug te vinden |
| **Festival-apps** (per festival) | Line-up en terreinkaart | Meestal geen vrienden zoeken, en elk festival heeft een andere app |

Waarbenje combineert het tijdelijke, groepsgerichte delen met hulp voor de laatste meters (richting, herkenningspunten, flash-scherm).

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Contact

Sander Hostyn

Project: [https://github.com/Sander03/Friend-finder-app](https://github.com/Sander03/Friend-finder-app)

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>
