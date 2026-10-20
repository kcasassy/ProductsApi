# Products API

ASP.NET Core Web API with validation, centralized exception handling,
Problem Details, and pagination.

| Method | Endpoint | Success | Errors |
|---|---|---|---|
| GET | /api/products | 200 | 500 |
| GET | /api/products/{id} | 200 | 404, 500 |
| POST | /api/products | 201 | 400, 409, 500 |
| PUT | /api/products/{id} | 200 | 400, 404, 409, 500 |
| DELETE | /api/products/{id} | 204 | 404, 500 |