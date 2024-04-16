using Microsoft.EntityFrameworkCore;
using online_dictionary.Models;

namespace online_dictionary.Data
{
    public class OnlineDictionaryContext : DbContext
    {
        public DbSet<WordSQL> WordSQLs { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_URI"));
        }
    }
}
