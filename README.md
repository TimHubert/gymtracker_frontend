Markdown


# GymTracker - Frontend

Fitness-Tracker zur Dokumentation und Analyse von Trainingseinheiten.

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Features](#features)
- [Technologie-Stack](#technologie-stack)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Mitwirkende](#mitwirkende)

## Über das Projekt

Unser GymTracker ist eine webbasierte Anwendung zur Verwaltung und Verfolgung von Fitness-Trainingseinheiten. Die App ermöglicht es Nutzern, ihre Workouts zu planen, durchzuführen und den Fortschritt über die Zeit zu analysieren.
Die Idee war es, das Notizbuch im Gym abzulösen.
![Image](https://github.com/user-attachments/assets/e9d0619e-d84b-445f-932e-164b702b40e2)

**Entwickelt von:** Tim Hubert und Philipp Zodikov  
**Kurs:** Webtechnologien

## Features

### Grundfunktionen
- **Benutzerregistrierung und -anmeldung**: Sichere Authentifizierung für personalisierte Trainingspläne
- **Workout-Verwaltung**: Erstellen, Bearbeiten und Löschen von Trainingseinheiten
- **Übungsdatenbank**: Sammlung von Fitnessübungen mit Beschreibungen
- **Trainingsprotokoll**: Dokumentation von Sätzen, Wiederholungen und Gewichten
- **Fortschrittsverfolgung**: Visualisierung der Leistungsentwicklung über Zeit

### Erweiterte Features
- **Statistiken und Analysen**: Detaillierte Auswertungen der Trainingsleistung
- **Responsive Design**: Optimiert für Desktop, Tablet und Handy

## Technologie-Stack

### Frontend
- **Framework**: React.js / Vue.js / Angular (je nach Implementierung)
- **Styling**: CSS3 / Tailwind CSS / Material-UI
- **State Management**: Redux / Vuex / Context API
- **HTTP-Client**: Axios / Fetch API
- **Build-Tool**: Vite / Webpack

### Backend (separates Repository)
- **Server**: Node.js mit Express.js
- **Datenbank**: MongoDB / PostgreSQL
- **Authentifizierung**: JWT (JSON Web Tokens)
- **API**: RESTful API

## Installation

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm oder yarn
- Git

### Schritt-für-Schritt Anleitung

1. **Repository klonen**

2. **Dependencies installieren**

3. **Backend starten** 

4. **Frontend starten**

5. **Anwendung öffnen**
   
   Navigiere zu `http://localhost:5173` (oder dem in der Konsole angezeigten Port)

## Verwendung

### 1. Registrierung/Anmeldung

#### Neuen Account erstellen:
Desktop:

<img width="1510" alt="Image" src="https://github.com/user-attachments/assets/b08cb5b1-ff86-42f5-b0ca-cf1d10937cc9" />
Handy:

![Image](https://github.com/user-attachments/assets/a20f25a6-a2c0-474c-9c9a-2bf75328d4f2)
1. Klicke auf "Registrieren" auf der Startseite
2. Fülle das Formular aus:
   - Benutzername (min. 3 Zeichen)
   - E-Mail-Adresse
   - Passwort (min. 8 Zeichen)
3. Bestätige die Registrierung

#### Anmelden:
Desktop:

<img width="1508" alt="Image" src="https://github.com/user-attachments/assets/0c6227b4-9ace-4bed-971c-b3d139291e09" />
Handy:

![Image](https://github.com/user-attachments/assets/9c00a326-2750-4b53-8745-521f120d016a)

1. Gib deine E-Mail und Passwort ein
2. Klicke auf "Anmelden"

### 2. Dashboard

Nach erfolgreicher Anmeldung siehst du:
- **Home**: Übersicht und Erstellung der Übungen

<img width="1509" alt="Image" src="https://github.com/user-attachments/assets/862c0716-d4c2-45c9-8506-289cd67d3619" />

- **Tracker**: Tracker für Übungen

<img width="1507" alt="Image" src="https://github.com/user-attachments/assets/cdb80fb5-0e30-4ed1-8a30-e8907bd2a331" />

- **Stats**: Statistiken deiner Leistung

<img width="1511" alt="Image" src="https://github.com/user-attachments/assets/1e214185-15e9-4015-8b2f-8230b5c84361" />

### 3. Workout erstellen

1. Klicke auf das Plus-Symbol
2. Wähle einen Namen für dein Workout
3. Füge Übungen hinzu:
   - Suche in deiner Übungsdatenbank
   - Oder erstelle eine neue Übung
4. Speichere das Workout

### 4. Training durchführen

1. Wähle ein Workout aus deiner Liste
2. Für jede Übung:
   - Trage Gewicht und Wiederholungen ein
   - Nutze den Timer für Pausen zwischen Sätzen
   - Markiere abgeschlossene Sätze
3. Beende das Training und speichere die Daten

### 5. Fortschritt analysieren

1. Navigiere zum "Statistik"-Bereich
2. Wähle eine Übung oder Muskelgruppe
3. Betrachte Diagramme zu:
   - Gewichtsentwicklung
   - Volumen (Gewicht × Wiederholungen)
   - Trainingsfrequenz


## Mitwirkende

- **Tim Hubert**
- **Philipp Zodikov** 

## Lizenz

Dieses Projekt wurde im Rahmen des Moduls "Webtechnologien" im Studiengang Wirtschaftsinformatik an der HTW-Berlin entwickelt.
