using System.Diagnostics;
using AM_web.Models;
using Microsoft.AspNetCore.Mvc;
using AM_web.Services.Interfaces;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace AM_web.Controllers
{
    public class MonitorController : Controller
    {

        private readonly IAssemby _assembly;

        public MonitorController(ILogger<MonitorController> logger, IAssemby assembly)
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
                    software_name = "AM_web";
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


        [HttpGet]
        [Route("api/assemblymonitor/GetAssemblyMonitor")]
        public async Task<IActionResult> GetAssemblyMonitor(string plant, string lineIdCMS)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                if (string.IsNullOrEmpty(lineIdCMS))
                {
                    return BadRequest(new { success = false, message = "El parámetro lineIdCMS es requerido" });
                }

                var assemblyMonitor = await _assembly.GetAssemblyMonitor(plant, lineIdCMS);
                return Ok(assemblyMonitor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar información del monitor de ensamblaje", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<MDManagerLineResponse>> PostManagerLine([FromBody] MDManagerLineRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new MDManagerLineResponse
                    {
                        Msj = "Datos de solicitud inválidos",
                        Result = "ERROR"
                    });
                }

                var result = await _assembly.PostManagerLine(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new MDManagerLineResponse
                {
                    Msj = $"Error interno del servidor: {ex.Message}",
                    Result = "ERROR"
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetLineDetail(string line_id, string plant)
        {
            try
            {
                if (string.IsNullOrEmpty(line_id))
                {
                    return BadRequest(new { success = false, message = "El parámetro line_id es requerido" });
                }

                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                var lineDetail = await _assembly.GetLineDetail(line_id, plant);
                return Ok(lineDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar detalles de la línea", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetLineManager(string plant, string line_id)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                if (string.IsNullOrEmpty(line_id))
                {
                    return BadRequest(new { success = false, message = "El parámetro line_id es requerido" });
                }

                var lineManager = await _assembly.GetLineManager(plant, line_id);
                return Ok(lineManager);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar información del gerente de línea", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> DeleteManagerLine(string plant, string employee)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                if (string.IsNullOrEmpty(employee))
                {
                    return BadRequest(new { success = false, message = "El parámetro employee es requerido" });
                }

                var result = await _assembly.DeleteManagerLine(plant, employee);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new MDManagerLineResponse
                {
                    Msj = $"Error interno del servidor: {ex.Message}",
                    Result = "ERROR"
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomer(string plant)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                var customers = await _assembly.GetCustomer(plant);
                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar clientes", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectByCustomer(string id_customer, string plant)
        {
            try
            {
                if (string.IsNullOrEmpty(id_customer))
                {
                    return BadRequest(new { success = false, message = "El parámetro id_customer es requerido" });
                }

                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                var projects = await _assembly.GetProjectByCustomer(id_customer, plant);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar proyectos", error = ex.Message });
            }
        }

        public async Task<IActionResult> GetImageCar(string plant, string line_id)
        {
            try
            {
                if (string.IsNullOrEmpty(plant))
                {
                    return BadRequest(new { success = false, message = "El parámetro plant es requerido" });
                }

                if (string.IsNullOrEmpty(line_id))
                {
                    return BadRequest(new { success = false, message = "El parámetro line_id es requerido" });
                }
                var imageCar = await _assembly.GetImageCar(plant, line_id);
                return Ok(imageCar);
            } catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar imagen del carro", error = ex.Message });
            }
        }
    }
}
