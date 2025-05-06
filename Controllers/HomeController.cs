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

        [HttpGet]
        // [Route("api/line/GetLines")]
        public async Task<IActionResult> GetLines(string plant_id)
        {
            try
            {
                if (string.IsNullOrEmpty(plant_id))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant_id es requerido" });
                }

                var lines = await _assembly.GetLines(plant_id);
                return Ok(lines);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar líneas", error = ex.Message });
            }
        }

        [HttpGet]
        // [Route("api/adminservice/GetUserDomain")]
        public async Task<IActionResult> GetUserDomain(string software_name = null, string ip_add = null)
        {
            try
            {
                // Obtener la dirección IP del cliente si no se proporciona
                if (string.IsNullOrEmpty(ip_add))
                {
                    ip_add = HttpContext.Connection.RemoteIpAddress?.ToString();
                    
                    // Si estamos detrás de un proxy, intentar obtener la IP real
                    string headerIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                    if (!string.IsNullOrEmpty(headerIp))
                    {
                        // X-Forwarded-For puede contener múltiples IPs separadas por comas
                        ip_add = headerIp.Split(',')[0].Trim();
                    }
                    
                    // Si aún no tenemos una IP válida, usar una predeterminada
                    if (string.IsNullOrEmpty(ip_add) || ip_add == "::1")
                    {
                        ip_add = "127.0.0.1";
                    }
                }

                // Asignar un nombre de software predeterminado si no se proporciona
                if (string.IsNullOrEmpty(software_name))
                {
                    software_name = "AppManagementEnsableMonitor";
                }

                var userDomain = await _assembly.GetUserDomain(software_name, ip_add);
                return Ok(userDomain);
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, new { success = false, message = "Error al recuperar información del dominio", error = ex.Message });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        public async Task<IActionResult> PostImageCar([FromBody] MDImageCarRequest request)
        {

            // return Ok("SUCCESS");
            try
            {
                // Validar el modelo
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Datos de solicitud inválidos", errors = ModelState });
                }

                // Validar que los campos requeridos no estén vacíos
                if (string.IsNullOrEmpty(request.Plant) || 
                    string.IsNullOrEmpty(request.LineId) || 
                    string.IsNullOrEmpty(request.ImageBase64) || 
                    string.IsNullOrEmpty(request.RegisterUser))
                {
                    return BadRequest(new { success = false, message = "Todos los campos son requeridos" });
                }

                var response = await _assembly.PostImageCar(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new MDImageCarResponse 
                { 
                    Msj = "Error al subir la imagen del carro", 
                    Result = ex.Message 
                });
            }
        }

        [HttpGet]
        [Route("api/assemblymonitor/GetManagerType")]
        public async Task<IActionResult> GetManagerType(string plant)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                var managerType = await _assembly.GetManagerType(plant);
                return Ok(managerType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar tipo de gerente", error = ex.Message });
            }
        }
    }
}
