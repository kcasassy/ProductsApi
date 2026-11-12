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

#	Test Scenario							Expected Status			Actual Status
1	GET all products without token				200 OK					200
2	Register a new user without token			201 Created				201
3	Login using correct credentials				200 OK					200
4	Login using incorrect password			401 Unauthorized			401
5	Add product without token				401 Unauthorized			401
6	Add product using a User/Student token		403 Forbidden			403
7	Add product using an Admin token			201 Created				201
8	Delete product using an Admin token			204 No Content			204