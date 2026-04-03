# TaskFlow Landing

TaskFlow is a polished multi-stack workspace that includes:

- a static HTML/CSS/JS version
- a React + Tailwind dashboard
- a FastAPI starter backend

## Live Demo

React site on GitHub Pages:

- `https://sevo17-code.github.io/taskflow-landing/`

If the link does not open yet, wait for the GitHub Actions deployment workflow to finish after pushing to `main`.
If this is the first deployment, open `Settings > Pages` in the repository and make sure the source is set to `GitHub Actions`.
Also make sure the repository is public if you want GitHub Pages to serve it publicly.

## Project Structure

- `TaskFlow-landing.html`
  Static version that opens directly in the browser
- `style.css`
  Styles for the static version
- `app.js`
  Interactions for the static version
- `react-tailwind/`
  React + Tailwind frontend version
- `fastapi/`
  Python + FastAPI backend starter
- `.github/workflows/deploy-pages.yml`
  Automatic deployment of the React app to GitHub Pages

## Key Improvements

- Split the old single-file page into separate files
- Added a cleaner React implementation with Arabic/English switching
- Added task deletion, clear-all, and restore-starter-list actions
- Preserved local state with `localStorage`
- Added a FastAPI API starter for future backend integration
- Added GitHub Pages deployment for the React app

## Run Locally

### Static Version

Open `TaskFlow-landing.html` directly in the browser.

### React + Tailwind

1. Open the `react-tailwind` folder
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173`

### FastAPI

1. Open the `fastapi` folder
2. Run `pip install -r requirements.txt`
3. Run `uvicorn main:app --reload`
4. Open `http://127.0.0.1:8000/docs`

## Suggested Next Upgrade

The next strong step is connecting the React frontend to the FastAPI endpoints instead of keeping the React data local-only.
