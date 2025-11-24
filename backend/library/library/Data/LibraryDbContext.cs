using Microsoft.EntityFrameworkCore;
using library.Models;

namespace library.Data
{
    // DbContext: Acts as the session with the database. Manages data interaction 
    // and tracks changes to the entities (Books, Authors, Users).
    public class LibraryDbContext : DbContext
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }
        public DbSet<Author> Authors {  get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>()
            .HasOne(b => b.Author)
            .WithMany(a => a.Books)
            .HasForeignKey(b => b.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        }

    }
}
