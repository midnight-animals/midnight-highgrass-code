using Microsoft.AspNetCore.Mvc;
using online_dictionary.Services;
using System.Threading;

namespace online_dictionary.Controllers
{
    [Route("api/status")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly IWordEntryService _wordEntryService;
        public StatusController(IWordEntryService wordEntryService)
        {
            _wordEntryService = wordEntryService;
        }
        [HttpGet]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                // Check if the database connection is successful
                var databaseStatus = await CheckDatabaseStatus();

                // Return application and database status
                return Ok(new
                {
                    applicationStatus = "Running",
                    databaseStatus = databaseStatus ? "Connected" : "Disconnected"
                });
            }
            catch (Exception ex)
            {
                // Log or handle any exceptions
                return StatusCode(500, $"Error occurred while checking status: {ex.Message}");
            }
        }
        private async Task<bool> CheckDatabaseStatus()
        {
            // Create a task to check the database status
            var dbCheckTask = _wordEntryService.IsMongoDBConnected();

            // Wait for either the database check task to complete or a timeout to occur
            var completedTask = await Task.WhenAny(dbCheckTask, Task.Delay(5000));

            // If the database check task completed, return its result
            if (completedTask == dbCheckTask)
            {
                return await dbCheckTask;
            }
            else // If a timeout occurred, consider it as a failure
            {
                return false;
            }
        }
    }
}
