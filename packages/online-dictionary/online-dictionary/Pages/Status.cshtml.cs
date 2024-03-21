using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using online_dictionary.Services;

namespace online_dictionary.Pages
{
    public class StatusModel : PageModel
    {
        private readonly IWordEntryService _wordEntryService;
        public StatusModel(IWordEntryService wordEntryService)
        {
            _wordEntryService = wordEntryService;
        }
        public string AppStatus { get; private set; }
        public string DBStatus { get; private set; }
        public void OnGet()
        {
            AppStatus = "Running";
            DBStatus = "Fetching";
        }
	}
}
