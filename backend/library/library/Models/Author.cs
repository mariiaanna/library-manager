namespace library.Models
{
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime? BirtDate { get; set; }
        public DateTime? DeathDate { get; set; }
        public string Nationality { get; set; }
        public virtual ICollection<Book> Books { get; set; }
    }
}
