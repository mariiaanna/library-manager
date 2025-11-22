using System.ComponentModel.DataAnnotations;

namespace library.DTOs
{
    public class UserLoginDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Password {  get; set; } = string.Empty;
    }
}
