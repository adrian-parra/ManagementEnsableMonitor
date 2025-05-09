using System;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;
using AppManagementEnsableMonitor.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AppManagementEnsableMonitor.Controllers
{
    public class LineController : ControllerBase
    {
        private readonly IAssemby _assemblyService;
       

        public LineController(IAssemby assemblyService, ILogger<LineController> logger)
        {
            _assemblyService = assemblyService;
           
        }

        [HttpPost]
        public async Task<ActionResult<MDUpdateLineResponse>> UpdateLine([FromBody] MDUpdateLineRequest request)
        {
            try
            {
                
                if (request == null)
                {
                    return BadRequest(new { success = false, message = "La solicitud no puede estar vacía" });
                }

                if (string.IsNullOrEmpty(request.LineId))
                {
                    return BadRequest(new { success = false, message = "El parámetro LineId es requerido" });
                }

                var result = await _assemblyService.UpdateLine(request);

              

                
                if (result.Result == "SUCCESS")
                {
                    return Ok(result);
                }else if (result.Result == "")
                {
                    return Ok(result); 
                }
                else
                {
                    return StatusCode(500, new MDUpdateLineResponse { Result = "ERROR", Msj = result.Msj });
                }
            }
            catch (Exception ex)
            {
                
                // return StatusCode(500, new { success = false, message = "Error al actualizar la línea", error = ex.Message });
                 return StatusCode(500, new MDUpdateLineResponse
                {
                    Msj = $"Error interno del servidor: {ex.Message}",
                    Result = "ERROR"
                });
            }
        }
    }
}