# Lab Log

## Part 0 — Baseline
- Invalid product was accepted before validation.
- Missing product returned an incorrect error response.

## Part 1 — Validation
- Added Data Annotations.
- Invalid input returns 400 Bad Request.

## Part 2 — Custom Rule
- SalePrice must be less than Price.
- Added NotFoundException and ConflictException.

## Part 3 — Exception Handling
- Added GlobalExceptionHandler.
- Missing product returns 404 Problem Details.
- Exceptions are logged on the server.

## Part 4 — Standard Responses
- POST returns 201 Created with Location.
- DELETE returns 204 No Content.
- Collection endpoint supports pagination.

## Reflection
Input validation rejects invalid data before processing.
Centralized exception handling makes errors consistent.
Problem Details provides a standard error format.
Pagination helps clients retrieve products efficiently.
Together, these features improve API reliability.