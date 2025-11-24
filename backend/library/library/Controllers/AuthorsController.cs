using library.Data;
using library.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace library.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorsController : ControllerBase
    {
        private readonly LibraryDbContext _context;
        public AuthorsController(LibraryDbContext context)
        {
            _context = context;
        }
        // GET: api/Authors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Author>>> GetAuthors()
        {
            return Ok(await _context.Authors.ToListAsync());
        }

        // GET: api/Authors/{id}
        [HttpGet ("{id}")]
        public async Task<ActionResult<Author>> GetAuthorById(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
            {
                return NotFound();
            }
            return Ok(author);
        }

        // POST: api/Authors
        [HttpPost]
        public async Task<ActionResult<Author>> AddAuthor(Author newAuthor) 
        {
            if (newAuthor == null)
            {
                return BadRequest();
            }
            _context.Authors.Add(newAuthor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAuthorById), new {id = newAuthor.Id}, newAuthor);
        }

        // PUT: api/Authors/{id}
        [HttpPut ("{id}")]
        public async Task<IActionResult> EditAuthor(int id, Author updatedAuthor)
        {
            if (id != updatedAuthor.Id)
            {
                return BadRequest();
            }
            _context.Entry(updatedAuthor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch(DbUpdateConcurrencyException)
            {
                if(!_context.Authors.Any(e => e.Id == id))
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

        // DELETE: api/Authors/{id}
        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
            {
                return NotFound();
            }
            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();

            return NoContent();

        }

    }
}
