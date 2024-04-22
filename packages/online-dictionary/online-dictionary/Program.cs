using Microsoft.EntityFrameworkCore;
using online_dictionary.Data;
using online_dictionary.Models;
using online_dictionary.Seeder;
using online_dictionary.Services;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

ConfigureEnvVariables();
ConfigureServices(builder.Services);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllers();

var app = builder.Build();

// Seed the database with fake data (Uncomment to seed)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dataSeeder = services.GetRequiredService<IWordEntrySeeder>(); // Assuming you have registered IDataSeeder in ConfigureServices

    //await dataSeeder.Seed(100);
    //await dataSeeder.Import(@"words_definitions.json");
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();

void ConfigureEnvVariables()
{
    //Environment.SetEnvironmentVariable("MONGODB_CONNECTION_URI", builder.Configuration.GetSection("MongoDB")
    //    .GetSection("ConnectionURI").Value);
    //Environment.SetEnvironmentVariable("MONGODB_DATABASE", builder.Configuration.GetSection("MongoDB")
    //    .GetSection("Database").Value);
    //Environment.SetEnvironmentVariable("MONGODB_DATABASE_FAKE", builder.Configuration.GetSection("MongoDB")
    //    .GetSection("DatabaseFake").Value);
    if (Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_URI") == null)
        Environment.SetEnvironmentVariable("SQLSERVER_CONNECTION_URI", builder.Configuration.GetSection("SQLServer")
            .GetSection("ConnectionURI").Value);
    if (Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_URI_FAKE") == null)
        Environment.SetEnvironmentVariable("SQLSERVER_CONNECTION_URI_FAKE", builder.Configuration.GetSection("SQLServer")
            .GetSection("ConnectionURIFake").Value);
}
void ConfigureServices (IServiceCollection services)
{
    services.AddAutoMapper(typeof(Program).Assembly);
    services.AddScoped<IWordEntryService, WordEntryService>();
    services.AddScoped<IUserService, UserService>();
	services.AddScoped<IWordEntrySeeder, WordEntrySeeder>();
    services.AddDbContext<OnlineDictionaryContext>(options =>
    {
        options.UseSqlServer(Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_URI"));
    });
}