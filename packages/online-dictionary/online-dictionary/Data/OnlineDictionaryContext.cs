using Microsoft.EntityFrameworkCore;
using online_dictionary.Models;

namespace online_dictionary.Data
{
    public class OnlineDictionaryContext : DbContext
    {
        public OnlineDictionaryContext() { }
        public OnlineDictionaryContext(DbContextOptions<OnlineDictionaryContext> options) : base(options) { }
        public DbSet<WordSQL> WordSQLs { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {

            foreach (var entry in ChangeTracker.Entries<WordSQL>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                    default:
                        break;
                }
            }

            var result = await base.SaveChangesAsync(cancellationToken);

            return result;
        }
    }
}
