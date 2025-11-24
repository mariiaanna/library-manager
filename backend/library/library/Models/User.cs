namespace library.Models
{
    // Database Model: Represents the 'Users' table in the database.
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public byte[] PasswordHash { get; set; } = new byte[0];
        public byte[] PasswordSalt { get; set; } = new byte[0];

    }
}
