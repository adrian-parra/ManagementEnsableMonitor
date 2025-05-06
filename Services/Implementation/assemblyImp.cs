using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;
using AppManagementEnsableMonitor.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text.Json;

namespace AppManagementEnsableMonitor.Services.Implementation
{
    public class AssemblyImp : IAssemby
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

         private readonly string _apiBaseUrl;
         private readonly string _apiBaseUrlMch1;


        public AssemblyImp(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
            _apiBaseUrl = configuration.GetConnectionString("conApiAppMch");
            _apiBaseUrlMch1 = configuration.GetConnectionString("conApiAppMch1");

        }

       

        

        public async Task<List<MDPlant>> GetPlants()
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlMch1}/configuration/GetPlants";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var plants = JsonSerializer.Deserialize<List<MDPlant>>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return plants;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener plantas. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener plantas: {ex.Message}");
                throw new Exception($"Error de conexión al obtener plantas: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener plantas: {ex.Message}");
                throw;
            }
        }

        public async Task<List<MDLine>> GetLines(string plantId)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlMch1}/line/GetLines?plant_id={plantId}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var lines = JsonSerializer.Deserialize<List<MDLine>>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return lines;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener líneas. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener líneas: {ex.Message}");
                throw new Exception($"Error de conexión al obtener líneas: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener líneas: {ex.Message}");
                throw;
            }
        }
    }
}