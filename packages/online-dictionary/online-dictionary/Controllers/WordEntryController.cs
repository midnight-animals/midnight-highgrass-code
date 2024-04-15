using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using online_dictionary.Models;
using online_dictionary.Services;

namespace online_dictionary.Controllers
{
    [Route("api/words")]
    [ApiController]
    public class WordEntryController : Controller
    {
        private readonly IWordEntryService _wordEntryService;
        private readonly int maxPageSize = 20;
        public WordEntryController(IWordEntryService wordEntryService)
        {
            _wordEntryService = wordEntryService;
        }
        [HttpGet]
        public async Task<IActionResult> GetPaginatedWordEntries(int page = 1, int pageSize = 20)
        {
            if (pageSize > maxPageSize) { pageSize = maxPageSize; }
            var wordEntries = await _wordEntryService.GetPaginatedWordEntriesAsync(page, pageSize);
            long count = wordEntries.Count();
            long total = await _wordEntryService.GetCountAsync();
            long totalPage = (long)total / pageSize + (total % pageSize != 0 ? 1 : 0);
            return Ok(new {
                data = wordEntries, 
                count = count,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPage = totalPage
            });
        }
        //[HttpGet("only-words")]
        //public async Task<IActionResult> GetAllOnlyWords()
        //{
        //    var words = await _wordEntryService.GetAllOnlyWordsAsync();
        //    return Ok(words);
        //}
        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            try
            {
                var searchResult = await _wordEntryService.Search(query);
                return Ok(searchResult);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
