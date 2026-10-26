# Contact Management Application

## Requirements
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

## Database setup
Start MySQL. Create the database (Spring Boot can also create it if the configured MySQL account has permission):
```sql
CREATE DATABASE contact_management;
```
Default connection is `root` / `root`. Set credentials before starting backend:
- Windows PowerShell: `$env:DB_USER="root"; $env:DB_PASSWORD="your_password"`
- macOS/Linux: `export DB_USER=root; export DB_PASSWORD=your_password`

## Run backend
```bash
cd backend
mvn spring-boot:run
```
REST API runs at `http://localhost:8009`; Hibernate creates/updates the table.

## Run frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Deploy frontend and backend
The frontend uses `VITE_API_BASE_URL` as the backend origin and defaults to `http://localhost:8009` for local development. `frontend/.env.example` shows the local setting. Vite embeds `VITE_*` values at build time, so do not put secrets in frontend environment variables.

### Render frontend
The repository includes `render.yaml` for deploying the React app as a Render Static Site. In Render, create a new **Blueprint** from this repository and provide `VITE_API_BASE_URL` as the origin of your public HTTPS backend (for example, `https://api.example.com`, without `/api`). The current web service is configured with the wrong root directory and a `yarn start` command. Create a new Static Site (service types cannot be converted) instead; it builds with `npm ci && npm run build` and publishes `frontend/dist`.

### Backend requirements
Deploy the Spring Boot API separately to a public HTTPS host and configure its database connection with that host's environment variables. Set `APP_CORS_ALLOWED_ORIGIN` on the backend to the exact frontend origin (for example, `https://your-site.onrender.com`). The backend CORS origin defaults to `http://localhost:5173` for local development.

## API
- `GET /api/contacts` list records
- `POST /api/contacts` create
- `PUT /api/contacts/{id}` update
- `DELETE /api/contacts/{id}` delete

Resource key for this project: `contacts`.

## Notes
The React UI is connected to the Spring Boot API and stores records in MySQL. Basic required-field, numeric, and email validation is provided. For a classroom deployment, extend validations and enforce any domain-specific uniqueness rules (for example roll numbers or book IDs) at the database/service layer.
