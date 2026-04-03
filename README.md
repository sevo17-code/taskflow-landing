# TaskFlow Landing

TaskFlow is now organized as a small multi-stack workspace so you can choose the version you want to keep building or publish.

## Project Map

- `TaskFlow-landing.html`
  Static vanilla version using plain HTML, CSS, and JavaScript
- `style.css`
  Styles for the static version
- `app.js`
  Interactions for the static version
- `react-tailwind/`
  Modern React + Tailwind version with a component-based dashboard
- `fastapi/`
  Python + FastAPI starter API for tasks, board cards, and pomodoro settings

## What Was Improved

- The original one-file page is already split into `HTML`, `CSS`, and `JS`
- The static version keeps language and last-open page in `localStorage`
- A React + Tailwind implementation was added for easier scaling
- A FastAPI backend starter was added so the project can grow beyond local browser storage
- A root `.gitignore` was added so the folder is cleaner for GitHub

## How To Use

### Static Version

Open `TaskFlow-landing.html` directly in the browser.

### React + Tailwind

1. Open the `react-tailwind` folder
2. Run `npm install`
3. Run `npm run dev`

### FastAPI

1. Open the `fastapi` folder
2. Create a virtual environment if you want
3. Run `pip install -r requirements.txt`
4. Start the server with `uvicorn main:app --reload`

Then open:

- API root: `http://127.0.0.1:8000/`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Suggested Next Step

If you want, the next strong move is to connect the React frontend to the FastAPI endpoints instead of keeping the React state local only.
