# Piano: Gestione Squadra di Calcio Amatoriale

## Obiettivo
Costruire un'applicazione web per gestire una squadra di calcio amatoriale reale: giocatori, formazioni, statistiche partita e allenamenti. Inserimento dati manuale.

## Decisione da confermare: autenticazione
Propongo due approcci. Indicami quale preferisci prima che inizi a scrivere codice.

### Opzione A — Single-user (consigliata per partire)
- Nessun login, un'unica squadra gestita dall'app.
- Più veloce da realizzare, ideale se l'app la usi tu da solo o in un unico dispositivo/ambiente.
- Dati salvati su Lovable Cloud (database PostgreSQL) senza autenticazione.

### Opzione B — Multi-utente
- Login con email/password o social (Lovable Cloud gestisce l'autenticazione).
- Ogni utente/amministratore vede e gestisce la propria squadra.
- Richiede route protette, politiche RLS e ruoli (admin/giocatore).

## Funzionalità MVP (fase 1)

### 1. Gestione giocatori
- Elenco giocatori con filtri per ruolo e stato (attivo/infortunato/sospeso).
- Scheda giocatore: nome, cognome, data di nascita, ruolo, numero di maglia, foto, telefono/email, note.
- CRUD completo: aggiungi, modifica, elimina.

### 2. Formazioni e tattiche
- Selezione modulo (4-3-3, 4-4-2, 3-5-2, ecc.).
- Campo visivo per trascinare/selezionare i titolari e le riserve.
- Salvataggio formazione per partita.

### 3. Statistiche partite
- Registrazione partita: avversario, data, risultato, modulo usato.
- Statistiche individuali per giocatore: presenze, gol, assist, ammonizioni, espulsioni, minuti giocati.
- Classifica marcatori e assist-man interna.

### 4. Allenamenti
- Calendario allenamenti con data, orario e luogo.
- Presenze allenamento per giocatore.
- Riepilogo presenze nel tempo.

### 5. Dashboard squadra
- Numero totale giocatori, reparti, ultima partita, prossimo allenamento.
- Grafici semplici: gol stagionali, presenze.

## Architettura tecnica

```text
Frontend: TanStack Start + React + TypeScript + Tailwind CSS v4
Stato server: TanStack Query + createServerFn
Backend/Persistenza: Lovable Cloud (PostgreSQL + auth se opzione B)
UI: shadcn/ui per tabelle, form, dialoghi, calendario
Icone: Lucide React
```

## Schema dati principale (Lovable Cloud)

```text
teams (solo opzione B)
  id, name, created_by, created_at

players
  id, team_id (opzione B), first_name, last_name, birth_date, role, jersey_number,
  phone, email, photo_url, status, notes, created_at

matches
  id, team_id (opzione B), opponent, match_date, location, home_or_away,
  score_team, score_opponent, formation, notes

match_stats
  id, match_id, player_id, goals, assists, yellow_cards, red_cards, minutes_played

training_sessions
  id, team_id (opzione B), date, time, location, notes

training_attendances
  id, training_session_id, player_id, attended
```

Ogni tabella `public` avrà i necessari `GRANT` e policy RLS (più stringenti per opzione B).

## Pagine / Route

```text
/                     Dashboard squadra
/players              Elenco giocatori
/players/new          Nuovo giocatore
/players/$id          Dettaglio giocatore
/players/$id/edit     Modifica giocatore
/formations           Formazioni salvate
/formations/new       Crea formazione
/matches              Partite
/matches/new          Nuova partita
/matches/$id          Dettaglio partita e statistiche
/trainings            Calendario allenamenti
/trainings/new        Nuovo allenamento
```

## Design/UI
- Tema sportivo pulito, con colori della squadra personalizzabili (default verde/bianco/nero).
- Layout responsive con sidebar su desktop e menu inferiore su mobile.
- Card per giocatori, tabelle per statistiche, campo da calcio schematico per le formazioni.

## Fasi di sviluppo

1. **Setup**: attivare Lovable Cloud, configurare schema database e seed di esempio.
2. **Giocatori**: CRUD completo con elenco e scheda dettaglio.
3. **Formazioni**: modulo selezionabile e campo visivo per schierare i giocatori.
4. **Partite e statistiche**: registrazione partita e inserimento statistiche individuali.
5. **Allenamenti**: calendario e presenze.
6. **Dashboard**: riepilogo e grafici.
7. **Auth (opzione B)**: proteggere route e dati per utente/squadra.

## Prossimo passo
Conferma l'opzione di autenticazione (A o B). Se scegli B, abiliterò anche il login prima di partire con il database.