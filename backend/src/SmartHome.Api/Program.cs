using SmartHome.Domain.Interfaces;
using SmartHome.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// SERVICES SECTION (DI Container)
// register dependencies and tools

// Add support for Controllers (this enables DevicesController)
builder.Services.AddControllers();

// Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// REPOSITORY REGISTRATION
// AddSingleton because we store data in memory (RAM)
// for a database, we use AddScoped
// Singleton ensures data persists across different requests
builder.Services.AddSingleton<IDeviceRepository, InMemoryDeviceRepository>();

var app = builder.Build();

// PIPELINE SECTION (Middleware)
// Here we define the request handling pipeline

// Enable Swagger UI only in Dev env.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI(); // Generates the interactive HTML page
}

app.UseHttpsRedirection(); // Redirect HTTP to HTTPS automatically

app.MapControllers(); // Map endpoints from [ApiController] classes

app.Run(); // Start the app