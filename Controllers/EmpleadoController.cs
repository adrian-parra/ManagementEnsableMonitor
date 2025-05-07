using System;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;
using AppManagementEnsableMonitor.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AppManagementEnsableMonitor.Controllers
{
    public class EmpleadoController : ControllerBase
    {
        private readonly IEmpleado _empleadoService;

        public EmpleadoController(IEmpleado empleadoService)
        {
            _empleadoService = empleadoService;
          
        }

        [HttpGet]
        public async Task<IActionResult> GetEmployee(string reloj)
        {
            try
            {
                if (string.IsNullOrEmpty(reloj))
                {
                    return BadRequest(new { success = false, message = "El parámetro reloj es requerido" });
                }

                var employee = await _empleadoService.GetEmployee(reloj);
                return Ok(employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar información del empleado", error = ex.Message });
            }
        }
    }
}