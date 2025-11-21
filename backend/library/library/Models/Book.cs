namespace library.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int PublicationYear { get; set; }
        public string Annotation { get; set; }
        public int AuthorId { get; set; }
        public virtual Author Author { get; set; }

    }
}
