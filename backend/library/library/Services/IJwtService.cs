using library.Models;

namespace library.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
