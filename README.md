# AI Weather Assistant

A full-stack AI-powered weather planning application.

The system combines real-time weather data, multi-day forecasts, and a contextual AI assistant to help users make decisions such as clothing choice, travel planning, and outdoor scheduling.

This project demonstrates API integration, backend service design, database persistence, AI prompt engineering, and containerized deployment.

---

## Features

- Search weather by city and date range
- Current weather + multi-day forecast
- AI-generated advice based on weather conditions
- Ask AI custom questions with contextual awareness
- Persistent request history stored in PostgreSQL
- Export history as CSV
- Clear history records
- One-command startup using Docker Compose

---

## System Architecture

Frontend (React) → Backend API (Express) → External APIs + Database

The backend aggregates:

- OpenWeather data (weather + forecast)
- AI reasoning (OpenAI)
- Persistent storage (PostgreSQL)

The AI assistant receives structured weather context and generates planning suggestions instead of generic chat responses.

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express

### Database

- PostgreSQL
- Prisma ORM

### External APIs

- OpenWeather API
- OpenAI API

### DevOps

- Docker
- Docker Compose

---

## Quick Start (Recommended)

### 1. Clone the project

```bash
git clone <your-repo-url>
cd AI-Weather-Assistant
```

---

### 2. Create environment file

Create a file named `.env` in the project root:

```env
OPENWEATHER_API_KEY=your_weather_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:postgres@db:5432/weather
```

---

### 3. Start the application

```bash
docker compose up --build
```

Then open:

Frontend
http://localhost:5173

Backend API
http://localhost:3000

---

### 4. Stop containers

```bash
docker compose down
```

---

## AI Functionality

The project contains two AI interaction modes:

### 1. Automatic Advice

After retrieving weather data, the backend sends structured weather context to the AI model to generate practical recommendations such as:

- clothing suggestions
- outdoor activity suitability
- travel comfort considerations

### 2. Ask AI (Context-Aware Q&A)

Users can ask follow-up questions.
The system sends both the user question and structured weather data to the model, allowing reasoning over:

- forecast comparison
- best day selection
- planning recommendations

This ensures the AI response is grounded in real weather data instead of generic responses.

---

## Development Mode (Optional)

Instead of Docker, you can run services separately.

Backend:

```bash
cd weather-ai-server
npm install
npm run dev
```

Frontend:

```bash
cd weather-ai-client
npm install
npm run dev
```

---

## Notes

- API keys are not included in this repository
- The project is intended for educational and demonstration purposes
- Docker is the recommended way to run the system
