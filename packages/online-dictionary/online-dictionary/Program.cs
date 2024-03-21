using online_dictionary.Models;
using online_dictionary.Seeder;
using online_dictionary.Services;
using System.Data;

var builder = WebApplication.CreateBuilder(args);

//Environment.SetEnvironmentVariable(
//	"MONGODB_CONNECTION_URI",
//	builder.Configuration.GetSection("MongoDB").Value.ConnectionURI);
ConfigureServices(builder.Services);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Seed the database with fake data (Uncomment to seed)
//using (var scope = app.Services.CreateScope())
//{
//    var services = scope.ServiceProvider;
//    var dataSeeder = services.GetRequiredService<IWordEntrySeeder>(); // Assuming you have registered IDataSeeder in ConfigureServices
//    dataSeeder.Seed(100);
//}

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

void ConfigureServices (IServiceCollection services)
{
	services.AddControllers();
	services.AddScoped<IWordEntryService, WordEntryService>();
    services.AddScoped<IWordEntrySeeder, WordEntrySeeder>();
	services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
	services.AddSingleton<WordEntryService>();
	services.AddSingleton<WordEntrySeeder>();
}