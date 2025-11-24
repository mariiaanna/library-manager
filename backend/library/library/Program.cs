using library.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var secretKey = builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Key not found.");
var issuer = builder.Configuration["JwtSettings:Issuer"];
var audience = builder.Configuration["JwtSettings:Audience"];
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddScoped<library.Services.IJwtService, library.Services.JwtService>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; 
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true, 
        IssuerSigningKey = new SymmetricSecurityKey(key), 
        ValidateIssuer = true,
        ValidIssuer = issuer, 
        ValidateAudience = true,
        ValidAudience = audience, 
        ClockSkew = TimeSpan.Zero 
    };
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
var connectionString = builder.Configuration.GetConnectionString("LibraryDbConnection");
builder.Services.AddDbContext<LibraryDbContext>(options => options.UseNpgsql(connectionString));

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins"; 

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.WithOrigins("http://127.0.0.1:5500",
                                              "http://localhost:5500") 
                                 .AllowAnyHeader()
                                 .AllowAnyMethod(); 
                      });
});

var app = builder.Build();




app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();



app.MapControllers();

app.Run();
