using Microsoft.Data.SqlClient;
using Migration_Project.AutoMapper;
using Migration_Project.Services.ASPWebFormDapperDemo.Services;
using Migration_Project.Services;
using System.Data;
using Migration_Project.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:4200") // Replace with your Angular app's URL
            .AllowAnyHeader()
            .AllowAnyMethod());
});
// Register application services.
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Configure database connection

/*builder.Services.AddScoped<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("CustomerInformation")));
*/
builder.Services.AddDbContext<CustomerDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("CustomerConnection")));


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();
// Use CORS
app.UseCors("AllowSpecificOrigin");

app.UseAuthorization();

app.MapControllers();

app.Run();
