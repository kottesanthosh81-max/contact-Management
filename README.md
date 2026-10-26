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

## API
- `GET /api/contacts` list records
- `POST /api/contacts` create
- `PUT /api/contacts/{id}` update
- `DELETE /api/contacts/{id}` delete

Resource key for this project: `contacts`.

## Notes
The React UI is connected to the Spring Boot API and stores records in MySQL. Basic required-field, numeric, and email validation is provided. For a classroom deployment, extend validations and enforce any domain-specific uniqueness rules (for example roll numbers or book IDs) at the database/service layer.
