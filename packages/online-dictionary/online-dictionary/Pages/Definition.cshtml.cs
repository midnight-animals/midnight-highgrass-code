using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using online_dictionary.Models;
using online_dictionary.Services;

namespace online_dictionary.Pages
{
    public class DefinitionModel : PageModel
    {
        public WordEntry wordEntry { get; set; }
        private readonly IWordEntryService _wordEntryService;
        public DefinitionModel(IWordEntryService wordEntryService)
        {
            _wordEntryService = wordEntryService;
        }
        public async Task OnGetAsync(string word)
        {
            //To-do: add a case when this can't connect to a database for whatever reason (or make an intergration test)
            try
            {
                wordEntry = await _wordEntryService.GetWordEntryAsync(word);
            }
            catch (Exception ex)
            {
                // Handle the exception, log it, or display an error message
                // For example:
                // logger.LogError(ex, "An error occurred while fetching the word entry.");
                // ViewData["ErrorMessage"] = "An error occurred while fetching the word entry. Please try again later.";
            }
        }
    }
}
