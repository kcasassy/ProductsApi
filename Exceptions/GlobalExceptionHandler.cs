using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ProductsApi.Exceptions;

namespace ProductsApi.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An API error occurred.");

        var (status, title) = exception switch
        {
            NotFoundException =>
                (404, "Resource not found"),
            ConflictException =>
                (409, "Conflict"),
            _ =>
                (500, "Internal server error")
        };

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title
        };

        httpContext.Response.StatusCode = status;

        await httpContext.Response.WriteAsJsonAsync(
            problem, cancellationToken);

        return true;
    }
}