# IPL Bayesian Predictor

A browser-only IPL prediction dashboard built with plain JavaScript.

## Features

- Prediction screen with team selection and batting-first logic
- Shared probability state across the app
- Dataset preview and downloadable CSV output
- Uses the bundled IPL dataset in the project root without any backend

## Run locally

From the project folder, serve it as a static site:

```bash
cd "c:/Projects/IPL predictor"
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Dataset

The app reads from [matches.csv](matches.csv) and expects these columns:

- id
- team1
- team2
- batting_first
- winner