const contentContainer = document.getElementById('contentContainer');
const authorsTab = document.getElementById('authorsTab');
const booksTab = document.getElementById('booksTab');


function switchTabs(activeTab, contentLoader){
    authorsTab.classList.remove('active');
    booksTab.classList.remove('active');

    activeTab.classList.add('active');
    contentLoader();
}

authorsTab.addEventListener('click', () => switchTabs(authorsTab, loadAuthors));
booksTab.addEventListener('click', () => switchTabs(booksTab, loadBooks));

switchTabs(booksTab, loadBooks);

async function loadBooks() {
    contentContainer.innerHTML = '<h2>Loading Books...</h2>';
    try {
        const books = await fetchProtectedData('Books'); 
        
        const html = books ? generateBooksTable(books) : '<p>No books found.</p>';
        
        contentContainer.innerHTML = html;

    } catch (error) {
        contentContainer.innerHTML = `<p style="color: red;">Error: Could not load data. ${error.message}</p>`;
    }
}

async function loadAuthors() {
    contentContainer.innerHTML = '<h2>Loading Authors...</h2>';
    try {
        const authors = await fetchProtectedData('Authors'); 
        
        const html = authors ? generateAuthorsTable(authors) : '<p>No authors found.</p>';
        
        contentContainer.innerHTML = html;

    } catch (error) {
        contentContainer.innerHTML = `<p style="color: red;">Error: Could not load data. ${error.message}</p>`;
    }
}


function generateAuthorsTable(authors) {
    let html = `
        <h2>Authors List</h2>
        <button onclick="showAddAuthorForm()">Add New Author</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Birth Date</th>
                    <th>Death Date</th>
                    <th>Nationality</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

    authors.forEach(author => {
        const birthDateDisplay = (author.birthDate && author.birthDate !== '0001-01-01T00:00:00')
            ? new Date(author.birthDate).toLocaleDateString() 
            : '-';
            
        const deathDateDisplay = (author.deathDate && author.deathDate !== '0001-01-01T00:00:00')
            ? new Date(author.deathDate).toLocaleDateString() 
            : '-';

        html += `
            <tr>
                <td>${author.id}</td>
                <td>${author.name}</td>
                <td>${birthDateDisplay}</td>
                <td>${deathDateDisplay}</td>
                <td>${author.nationality || '-'}</td> 
                <td>
                    <button onclick="showEditAuthorForm(${author.id})">Edit</button>
                    <button onclick="deleteAuthor(${author.id})">Delete</button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}
function generateBooksTable(books) {
    let html = `
        <h2>Books List</h2>
        <div id="filterFormContainer">
            </div>
        <button onclick="showAddBookForm()">Add New Book</button>
        <button onclick="exportBooks()">Export</button>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Year</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

    books.forEach(book => {
        const authorName = book.author ? book.author.name : 'Unknown Author';

        html += `
            <tr>
                <td>${book.title}</td>
                <td>${authorName}</td>
                <td>${book.publicationYear}</td>
                <td>
                    <button onclick="showEditBookForm(${book.id})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}



function getAuthorFormHTML(author = {}) {
    const isEditing = author.id !== undefined;
    const title = isEditing ? `Edit Author ID: ${author.id}` : 'Add New Author';
    const buttonText = isEditing ? 'Update Author' : 'Add Author';

    return `
        <h2>${title}</h2>
        <form id="authorForm" data-author-id="${author.id || ''}">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="${author.name || ''}" required>

            <label for="nationality">Nationality:</label>
            <input type="text" id="nationality" name="nationality" value="${author.nationality || ''}">

            <label for="birthDate">Birth Date (Optional):</label>
            <input type="date" id="birthDate" name="birthDate" value="${author.birthDate ? author.birthDate.split('T')[0] : ''}">

            <label for="deathDate">Death Date (Optional):</label>
            <input type="date" id="deathDate" name="deathDate" value="${author.deathDate ? author.deathDate.split('T')[0] : ''}">

            <button type="submit">${buttonText}</button>
            <button type="button" onclick="loadAuthors()">Cancel</button>
            <p id="formMessage" style="color: red; margin-top: 10px;"></p>
        </form>
    `;
}

function showAddAuthorForm() {
    contentContainer.innerHTML = getAuthorFormHTML();
    document.getElementById('authorForm').addEventListener('submit', handleAuthorSubmission);
}

async function handleAuthorSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const authorId = form.dataset.authorId;
    const isEditing = !!authorId;
    
    const toUtcIsoString = (dateString) => {
        if (!dateString || dateString.trim() === '') {
            return null; 
        }
        return new Date(dateString).toISOString(); 
    };

    const formData = {
        name: form.name.value,
        nationality: form.nationality.value,
        
        birthDate: toUtcIsoString(form.birthDate.value), 
        deathDate: toUtcIsoString(form.deathDate.value), 
        
        id: isEditing ? parseInt(authorId) : 0 
    };

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `Authors/${authorId}` : 'Authors';

    try {
        const result = await fetchProtectedData(endpoint, method, formData);
        
        alert(`Author ${isEditing ? 'updated' : 'added'} successfully!`);
        
        loadAuthors(); 

    } catch (error) {
        document.getElementById('formMessage').textContent = `Error: ${error.message}`;
        console.error("Author submission error:", error);
    }
}


async function deleteAuthor(id) {
    if (!confirm(`Are you sure you want to delete author with ID ${id}? This will also delete their books.`)) {
        return; 
    }
    
    try {
        await fetchProtectedData(`Authors/${id}`, 'DELETE');
        
        alert(`Author ID ${id} deleted successfully (including books).`);
        loadAuthors(); 
        
    } catch (error) {
        alert(`Error deleting author: ${error.message}`);
        console.error("Delete Author Error:", error);
    }
}


async function showEditAuthorForm(id) {
    try {
        const authorToEdit = await fetchProtectedData(`Authors/${id}`);

        if (!authorToEdit) {
            throw new Error("Author not found.");
        }
        
        contentContainer.innerHTML = getAuthorFormHTML(authorToEdit);
        
        document.getElementById('authorForm').addEventListener('submit', handleAuthorSubmission);

    } catch (error) {
        alert(`Could not load author details: ${error.message}`);
        loadAuthors(); 
    }
}