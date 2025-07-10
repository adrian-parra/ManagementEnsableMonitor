using System;
using System.Threading.Tasks;
using AM_web.Models;
using AM_web.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AM_web.Controllers
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

        [HttpGet]
        public async Task<IActionResult> GetEmployeeImage(string plant, string employee)
        {
            try
            {
                if (string.IsNullOrEmpty(plant) || string.IsNullOrEmpty(employee))
                {
                    return BadRequest(new { success = false, message = "Los parámetros plant y employee son requeridos" });
                }

                var employeeImage = await _empleadoService.GetEmployeeImage("mch1", employee);
                return Ok(employeeImage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar imagen del empleado", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUser(string plant, string user_id)
        {
            try
            {
                if (string.IsNullOrEmpty(plant) || string.IsNullOrEmpty(user_id))
                {
                    return BadRequest(new { success = false, message = "Los parámetros plant y user_id son requeridos" });
                }

                var user = await _empleadoService.GetUser(plant, user_id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al recuperar información del usuario", error = ex.Message });
            }
        }
    }
}