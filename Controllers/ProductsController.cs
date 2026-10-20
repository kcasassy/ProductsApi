using Microsoft.AspNetCore.Mvc;
using ProductsApi.Exceptions;
using ProductsApi.Models;

namespace ProductsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products = new();
    private static int _nextId = 1;

    [HttpGet]
    public IActionResult GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var data = Products
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new
        {
            data,
            meta = new
            {
                page,
                pageSize,
                totalCount = Products.Count,
                totalPages = (int)Math.Ceiling(
                    Products.Count / (double)pageSize)
            }
        });
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);

        if (product == null)
            throw new NotFoundException(
                $"Product with ID {id} was not found.");

        return Ok(product);
    }

    [HttpPost]
    public IActionResult Create(CreateProductRequest request)
    {
        var product = new Product
        {
            Id = _nextId++,
            Name = request.Name,
            Price = request.Price,
            SalePrice = request.SalePrice
        };

        Products.Add(product);

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            product);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(
        int id, UpdateProductRequest request)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);

        if (product == null)
            throw new NotFoundException(
                $"Product with ID {id} was not found.");

        product.Name = request.Name;
        product.Price = request.Price;
        product.SalePrice = request.SalePrice;

        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);

        if (product == null)
            throw new NotFoundException(
                $"Product with ID {id} was not found.");

        Products.Remove(product);

        return NoContent();
    }
}