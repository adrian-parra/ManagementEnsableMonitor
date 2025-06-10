using System;
using System.Threading.Tasks;
using AM_web.Models;
using AM_web.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AM_web.Controllers
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

              

                
                if (result.result == "UPDATE_OK")
                {
                    return Ok(result);
                }
                else
                {
                    return StatusCode(400, result);
                }
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new MDUpdateLineResponse
                {
                    
                    msj = "Error al actualizar la línea",
                    result = ex.Message,
                });
            }
        }
    }
}