using System.Diagnostics;
using AppManagementEnsableMonitor.Models;
using Microsoft.AspNetCore.Mvc;
using AppManagementEnsableMonitor.Services.Interfaces;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace AppManagementEnsableMonitor.Controllers
{
    public class HomeController : Controller
    {
        
        private readonly IAssemby _assembly;

        public HomeController(ILogger<HomeController> logger, IAssemby assembly)
        {

            _assembly = assembly;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        // [Route("api/configuration/GetPlants")]
        public async Task<IActionResult> GetPlants()
        {
            try
            {
                var plants = await _assembly.GetPlants();
                return Ok(plants);
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, new { success = false, message = "Error al recuperar plantas", error = ex.Message });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
