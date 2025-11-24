using library.Models;
using System.ComponentModel.DataAnnotations;

namespace library.DTOs
{
    //This model is used exclusively for receiving
    // login credentials (input data) from the client
    public class UserLoginDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Password {  get; set; } = string.Empty;
    }
}
