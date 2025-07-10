using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using AM_web.Models;
using AM_web.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AM_web.Services.Implementation
{
    public class EmpleadoImp : IEmpleado
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;
        private readonly string _apiBaseUrlApps;

        public EmpleadoImp(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiBaseUrl = configuration.GetConnectionString("conApiAppMch1");
            _apiBaseUrlApps = configuration.GetConnectionString("conApiAppMch");
        }

        public async Task<MDEmployee> GetEmployee(string reloj)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/empleado/GetEmployee?reloj={reloj}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var employee = JsonSerializer.Deserialize<MDEmployee>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return employee;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener información del empleado. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener información del empleado: {ex.Message}");
                throw new Exception($"Error de conexión al obtener información del empleado: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                // Manejar errores de deserialización
                Console.WriteLine($"Error al deserializar la respuesta: {ex.Message}");
                throw new Exception($"Error al deserializar la respuesta: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                Console.WriteLine($"Error al obtener información del empleado: {ex.Message}");
                throw;
            }
        }

        public async Task<MDEmployeeImage> GetEmployeeImage(string plant, string employee)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlApps}/assemblymonitor/GetEmployeeImage?plant={plant}&employee={employee}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var employeeImage = JsonSerializer.Deserialize<MDEmployeeImage>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    return employeeImage;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener imagen del empleado. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener imagen del empleado: {ex.Message}");
                throw new Exception($"Error de conexión al obtener imagen del empleado: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                // Manejar errores de deserialización
                Console.WriteLine($"Error al deserializar la respuesta de imagen: {ex.Message}");
                throw new Exception($"Error al deserializar la respuesta de imagen: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                Console.WriteLine($"Error al obtener imagen del empleado: {ex.Message}");
                throw;
            }
        }

        public async Task<MDUser> GetUser(string plant, string userId)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlApps}/assemblymonitor/GetUser?plant={plant}&user_id={userId}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var user = JsonSerializer.Deserialize<MDUser>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return user;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener información del usuario. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener información del usuario: {ex.Message}");
                throw new Exception($"Error de conexión al obtener información del usuario: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                // Manejar errores de deserialización
                Console.WriteLine($"Error al deserializar la respuesta de usuario: {ex.Message}");
                throw new Exception($"Error al deserializar la respuesta de usuario: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                Console.WriteLine($"Error al obtener información del usuario: {ex.Message}");
                throw;
            }
        }
    }
}