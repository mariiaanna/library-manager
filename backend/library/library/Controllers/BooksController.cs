using library.Data;
using library.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;


namespace library.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        public BooksController(LibraryDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks(
                [FromQuery] string? title,
                [FromQuery] string? authorName)
        {

            var booksQuery = _context.Books
                .Include(b => b.Author)
                .AsQueryable();

            if (!string.IsNullOrEmpty(title))
            {
                booksQuery = booksQuery.Where(b => b.Title.Contains(title));
            }
            if (!string.IsNullOrEmpty(authorName)) 
            { 
                booksQuery = booksQuery.Where(b => b.Author != null && b.Author.Name .Contains(authorName));
            }

            var books = await booksQuery.ToListAsync();

            return Ok(books);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBookById(int id)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound();
            }
            return Ok(book); 
        
        }
        [HttpGet("export/csv")]
        [Authorize] 
        public async Task<IActionResult> ExportBooksCsv()
        {
            var books = await _context.Books.Include(b => b.Author).ToListAsync();

            var csvContent = new StringBuilder();
            csvContent.AppendLine("Title,Author,PublicationYear,Annotation,Nationality");

            foreach (var book in books)
            {
                var line = $"{book.Title},{book.Author.Name},{book.PublicationYear},{book.Annotation},{book.Author.Nationality}";

                line = line.Replace(",", ";").Replace(Environment.NewLine, " ");

                csvContent.AppendLine(line);
            }

            return File(Encoding.UTF8.GetBytes(csvContent.ToString()),
                        "text/csv", 
                        $"books_export_{DateTime.Now.ToShortDateString()}.csv");
        }

        [HttpPost]
        public async Task<ActionResult<Book>> AddBook(Book newBook)
        {
            if (newBook == null)
            {
                return BadRequest();
            }
            await _context.Books.AddAsync(newBook);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBookById), new { id = newBook.Id }, newBook);
        }

        [HttpPut ("{id}")]
        public async Task<IActionResult> EditBook(int id, Book updatedBook)
        {
            if(id != updatedBook.Id)
            {
                return BadRequest();
            }
            _context.Entry(updatedBook).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if(!_context.Books.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
                
            }
            return NoContent();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
