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
The frontend uses `VITE_API_BASE_URL` as the backend origin and defaults to `http://localhost:8009` for local development. To deploy the frontend to Vercel:
1. Deploy the Spring Boot API to a public HTTPS host and configure its database connection using environment variables.
2. In the Vercel project's **Settings → Environment Variables**, set `VITE_API_BASE_URL` to the backend origin (for example, `https://api.example.com`, without `/api`).
3. Set `APP_CORS_ALLOWED_ORIGIN` in the backend host to the exact frontend origin (for example, `https://your-project.vercel.app`).
4. Redeploy the frontend after setting its environment variable.

The backend's CORS origin defaults to `http://localhost:5173` for local development. `frontend/.env.example` shows the local frontend setting. Vite embeds `VITE_*` values at build time, so do not put secrets in frontend environment variables.

## API
- `GET /api/contacts` list records
- `POST /api/contacts` create
- `PUT /api/contacts/{id}` update
- `DELETE /api/contacts/{id}` delete

Resource key for this project: `contacts`.

## Notes
The React UI is connected to the Spring Boot API and stores records in MySQL. Basic required-field, numeric, and email validation is provided. For a classroom deployment, extend validations and enforce any domain-specific uniqueness rules (for example roll numbers or book IDs) at the database/service layer.
