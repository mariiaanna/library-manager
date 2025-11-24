# library-manager

Project Overview 
This application is a full-stack, secure system designed for managing a simple library catalog.

Key Features Implemented:
Authentication: Secure Login/Logout protected via JWT.
CRUD Operations: Full Create, Read, Update, and Delete functionality for both Books and Authors.
Filtering: Functional search by Book Title and Author Name.
Export: CSV file generation for book list.

Technology Stack & Key Concepts
Backend / API: ASP.NET Core.
Database: PostgreSQL and EF Core 
Security: JWT Bearer Authentication.
Frontend: JavaScript, HTML/CSS.

Setup and Installation
Follow these steps to run the application locally:
Prerequisites: .NET SDK 8.0+, PostgreSQL Server.

Database Setup:
Update Backend/library/library/appsettings.json with your credentials.

Run Migrations: Navigate to the backend folder and run dotnet ef database update.

Running the Application:

Start Backend API: Navigate to the backend folder and run dotnet run. (API listens on https://localhost:7210/api).

Start Frontend: Open the Frontend/ folder in VS Code and use Live Server to open welcome.html