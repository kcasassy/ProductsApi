using System.ComponentModel.DataAnnotations;

namespace ProductsApi.Models;

public class CreateProductRequest : IValidatableObject
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal Price { get; set; }

    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal? SalePrice { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (SalePrice.HasValue && SalePrice.Value >= Price)
        {
            yield return new ValidationResult(
                "SalePrice must be less than Price.",
                new[] { nameof(SalePrice) });
        }
    }
}