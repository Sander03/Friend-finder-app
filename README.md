<a id="readme-top"></a>

<br />
<div align="center">
  <img src="public/icons/icon-192.png" alt="Logo" width="80" height="80">

  <h3 align="center">Waarbenje</h3>

  <p align="center">
    Vind je vrienden terug op festivals en evenementen.
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

Op een festival raak je je vrienden snel kwijt: het is druk, het bereik is slecht en "ik sta aan de bar" zegt weinig als er vijf bars zijn. **Waarbenje** toont je vrienden op een plattegrond rond jou, met de afstand, de richting en het dichtstbijzijnde herkenningspunt (Main Stage, Food court, ...). Ben je vlakbij maar zie je elkaar nog niet? Dan laat je je scherm in een felle kleur knipperen.

**Publieke link:** [PUBLIEKE-LINK]

Schermen in deze versie:

| Scherm | Wat het doet |
| --- | --- |
| **Aanmelden** (`/login`) | Aanmelden of een account maken (Supabase Auth). |
| **Kaart** (`/`) | Plattegrond met jou in het midden en je vrienden rondom, plus een lijst met afstand en "laatst gezien". Locaties komen live binnen (Supabase Realtime). |
| **Vriend zoeken** (`/friend`) | Kompasroos met een pijl naar je vriend, afstand, herkenningspunt en bericht. |
| **Flash** (`/flash`) | Knippert in de kleur van je vriend, zodat die je in de menigte ziet. |
| **Groep** (`/group`) | Groepscode delen, lid worden van een andere groep, afmelden. |

Privacy zit in het ontwerp: je locatie is alleen zichtbaar voor je groep, en het delen stopt automatisch na het evenement (afgedwongen met Row Level Security in de database).

> **Demo-modus:** ben je niet op het evenement (meer dan 3 km van het terrein) of geef je geen toegang tot je locatie, dan zet de app je op een vaste plek op het terrein. Zo zie je de demo-groep altijd zoals op een echt festival.

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
* `expo-location` (in de browser: de Geolocation API)
* Gehost op [Vercel](https://vercel.com) als PWA (manifest + service worker)

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Aan de slag

### Vereisten

* Node.js 20 of nieuwer
* Een (gratis) Supabase-project

### Database opzetten

1. Maak een project op [supabase.com](https://supabase.com).
2. Open **SQL Editor**, plak de inhoud van [`supabase/schema.sql`](supabase/schema.sql) en klik op **Run**. Dit maakt de tabellen, de beveiliging, realtime en de demo-groep aan.
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

* **Festival- en concertgangers** van 16 tot 30 jaar die in groep naar een evenement gaan en elkaar kwijtraken tussen podia, bars en toiletten.
* Ook bruikbaar voor **schooluitstappen, jeugdbewegingen en stadsfeesten**: elke situatie waar een groep tijdelijk samen op een druk terrein is.

Wat ze nodig hebben: snel zien waar iedereen is, zonder hun locatie voor altijd met iedereen te delen.

### Wat ik ga bouwen (roadmap)

- [x] **PWA (deze versie):** aanmelden, groep met code, live plattegrond rond jezelf, vriend zoeken met richting en afstand, flash-scherm, automatisch stoppen na het evenement.
- [ ] **Foto-pin "Ik sta hier":** een foto van wat je ziet (een vlag, een kraam) met een korte tekst, en verzamelpunten.
- [ ] **Echte kaart van het terrein:** plattegronden en podia per evenement, offline beschikbaar.
- [ ] **Native app (Expo dev build):** kompas dat meedraait met je gsm, locatie op de achtergrond, pushmeldingen ("Lotte vraagt om te flashen").
- [ ] **Bluetooth in de buurt:** "binnen ~10 m" voor de laatste meters, ook zonder internet.
- [ ] **Offline:** laatst bekende locaties en pins bewaren voor als het netwerk overbelast is.

### Concurrenten

| App | Wat ze goed doen | Waar Waarbenje anders is |
| --- | --- | --- |
| **Apple Zoek mijn / Find My** | Nauwkeurig, ingebouwd op iPhone | Alleen Apple, en delen is permanent en per persoon in plaats van per evenement |
| **Google Maps locatie delen** | Werkt op Android en iOS | Algemene kaart zonder podia of herkenningspunten; delen per persoon |
| **WhatsApp live locatie** | Iedereen heeft het al | Per chat en maximaal 8 uur; geen afstand, richting of groepsoverzicht |
| **Life360** | Gemaakt voor families | Gericht op permanent volgen en veiligheid, niet op een avond uit |
| **Snap Map** | Populair bij jongeren | Openbaar of semi-openbaar, niet gemaakt om iemand terug te vinden |
| **Festival-apps** (per festival) | Line-up en terreinkaart | Meestal geen vrienden zoeken, en elk festival heeft een andere app |

Waarbenje combineert het tijdelijke, groepsgerichte delen met hulp voor de laatste meters (richting, herkenningspunten, flash-scherm).

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>

## Contact

Sander Hostyn

Project: [GITHUB-LINK]

<p align="right">(<a href="#readme-top">terug naar boven</a>)</p>
