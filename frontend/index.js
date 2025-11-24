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
/*
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
*/
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
function generateBooksTable(books, currentTitle = '', currentAuthor = '') {

    const searchFormHTML = `
    <form id="searchForm" class="search-bar">
        <input type="text" name="searchTitle" placeholder="Search by Title" value="${currentTitle || ''}">
        <input type="text" name="searchAuthor" placeholder="Search by Author" value="${currentAuthor || ''}">
        
        <button type="submit">Search</button> 
        <button type="button" onclick="loadBooks()">Reset</button> 
        </form>
`;

    let html = `
        ${searchFormHTML}
        <div id="filterFormContainer"></div>
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

async function handleBookSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const bookId = form.dataset.bookId;
    const isEditing = !!bookId;

    const formData = {
        title: form.title.value,
        authorId: parseInt(form.authorId.value),
        publicationYear: parseInt(form.publicationYear.value),
        annotation: form.annotation.value,
        id: isEditing ? parseInt(bookId) : 0
    };

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `Books/${bookId}` : 'Books';

    try {
        await fetchProtectedData(endpoint, method, formData);

        alert(`Book ${isEditing ? 'updated' : 'added'} successfully!`);
        loadBooks();

    } catch (error) {
        document.getElementById('formMessage').textContent = `Error: ${error.message}`;
        console.error("Book submission error:", error);
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


async function getBookFormHTML(book = {}) {
    const isEditing = book.id !== undefined;
    const title = isEditing ? `Edit Book ID: ${book.id}` : 'Add New Book';
    const buttonText = isEditing ? 'Update Book' : 'Add Book';

    const authors = await fetchProtectedData('Authors'); 
    
    let authorOptions = '<option value="">-- Select Author --</option>';
    if (authors && authors.length > 0) {
        authors.forEach(author => {
            const isSelected = isEditing && book.authorId === author.id ? 'selected' : '';
            authorOptions += `<option value="${author.id}" ${isSelected}>${author.name}</option>`;
        });
    }

    return `
        <h2>${title}</h2>
        <form id="bookForm" data-book-id="${book.id || ''}">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" value="${book.title || ''}" required>

            <label for="authorId">Author (Required):</label>
            <select id="authorId" name="authorId" required>
                ${authorOptions}
            </select>
            
            <label for="publicationYear">Publication Year:</label>
            <input type="number" id="publicationYear" name="publicationYear" value="${book.publicationYear || ''}" required min="1000" max="2100">
            
            <label for="annotation">Annotation:</label>
            <textarea id="annotation" name="annotation">${book.annotation || ''}</textarea>

            <button type="submit">${buttonText}</button>
            <button type="button" onclick="loadBooks()">Cancel</button>
            <p id="formMessage" style="color: red; margin-top: 10px;"></p>
        </form>
    `;
}

async function showAddBookForm() {
    contentContainer.innerHTML = await getBookFormHTML();
    document.getElementById('bookForm').addEventListener('submit', handleBookSubmission);
}


function handleSearch(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.searchTitle.value;
    const authorName = form.searchAuthor.value;
    
    loadBooks(title, authorName);
}

function generateSearchFormHTML(currentTitle = '', currentAuthor = '') {
    return `
        <form id="searchForm" class="search-bar">
            <input type="text" name="searchTitle" placeholder="Search by Title" value="${currentTitle || ''}">
            <input type="text" name="searchAuthor" placeholder="Search by Author" value="${currentAuthor || ''}">
            <button type="submit">Search</button>
            <button type="button" onclick="loadBooks()">Reset</button>
        </form>
    `;
}
async function loadBooks(titleFilter = '', authorNameFilter = '') {
    contentContainer.innerHTML = '<h2>Loading Books...</h2>';
    
    let endpoint = 'Books';
    const params = [];
    
    // ... (Логіка формування параметрів запиту)
    if (titleFilter) { params.push(`title=${encodeURIComponent(titleFilter)}`); }
    if (authorNameFilter) { params.push(`authorName=${encodeURIComponent(authorNameFilter)}`); }

    if (params.length > 0) {
        endpoint += '?' + params.join('&');
    }
    
    try {
        const books = await fetchProtectedData(endpoint); 
        
        let htmlContent = `<h2>Books List</h2>`; // Заголовок завжди видимий

        if (books && books.length > 0) {
            // 1. Якщо є результати: відображаємо таблицю
            htmlContent += generateBooksTable(books, titleFilter, authorNameFilter); 
        } else {
            // 2. Якщо результатів немає: відображаємо форму пошуку + повідомлення
            
            // Ми повинні згенерувати форму пошуку, щоб користувач міг її очистити/змінити
            const searchFormHTML = generateSearchFormHTML(titleFilter, authorNameFilter); 
            
            htmlContent = `
                <h2>Books List</h2>
                ${searchFormHTML}
                <p style="text-align: center; margin-top: 30px; color: #cc3333;">
                    No matches found.
                </p>
                <div style="text-align: center;">
                    <button type="button" onclick="loadBooks()">Show All Books</button>
                </div>
            `;
            
            // ВАЖЛИВО: Оскільки ми змінили спосіб генерації HTML при відсутності результатів, 
            // нам потрібно переконатися, що форма пошуку та reset-кнопка вбудовані правильно.
        }
        
        contentContainer.innerHTML = htmlContent;
        
        // Прив'язуємо слухач тільки якщо форма пошуку була відображена
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', handleSearch);
        }

    } catch (error) {
        contentContainer.innerHTML = `<p style="color: red;">Error: Could not load data. ${error.message}</p>`;
    }
}

const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', () => {
    // 1. КРИТИЧНО: Видаляємо токен з локального сховища
    localStorage.removeItem('jwtToken'); 

    // 2. Перенаправляємо користувача на вітальну сторінку
    window.location.href = 'welcome.html'; 
});