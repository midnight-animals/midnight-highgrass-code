using online_dictionary.Models;
using online_dictionary.Services;

var builder = WebApplication.CreateBuilder(args);

ConfigureServices(builder.Services);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

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
	services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
	services.AddSingleton<WordEntryService>();
}