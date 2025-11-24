using System.ComponentModel.DataAnnotations;

namespace library.DTOs
{
    //Used exclusively to safely receive registration credentials 
    // from the client.
    public class UserRegisterDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}
