using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;
using AppManagementEnsableMonitor.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text.Json;
using System.Text;

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

        public async Task<MDUserDomain> GetUserDomain(string softwareName, string ipAdd)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/adminservice/GetUserDomain?software_name={softwareName}&ip_add={ipAdd}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var userDomain = JsonSerializer.Deserialize<MDUserDomain>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return userDomain;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener información del dominio del usuario. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener información del dominio: {ex.Message}");
                throw new Exception($"Error de conexión al obtener información del dominio: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener información del dominio: {ex.Message}");
                throw;
            }
        }

        public async Task<MDImageCarResponse> PostImageCar(MDImageCarRequest request)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/assemblymonitor/PostImageCar";
                
                // Serializar el objeto de solicitud a JSON
                string jsonRequest = JsonSerializer.Serialize(request);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                
                // Realizar la solicitud HTTP POST
                HttpResponseMessage response = await _httpClient.PostAsync(requestUrl, content);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var imageCarResponse = JsonSerializer.Deserialize<MDImageCarResponse>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return imageCarResponse;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al subir la imagen del carro. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al subir la imagen: {ex.Message}");
                throw new Exception($"Error de conexión al subir la imagen: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                // Manejar errores de serialización/deserialización
                Console.WriteLine($"Error al procesar la respuesta JSON: {ex.Message}");
                throw new Exception($"Error al procesar la respuesta JSON: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                Console.WriteLine($"Error al subir la imagen del carro: {ex.Message}");
                throw;
            }
        }

        public async Task<List<MDManagerType>> GetManagerType(string plant)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/assemblymonitor/GetManagerType?plant={plant}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {

                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var managerType = JsonSerializer.Deserialize<List<MDManagerType>>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return managerType;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener tipo de gerente. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener tipo de gerente: {ex.Message}");
                throw new Exception($"Error de conexión al obtener tipo de gerente: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener tipo de gerente: {ex.Message}");
                throw;
            }
        }

        public async Task<MDManagerLineResponse> PostManagerLine(MDManagerLineRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync($"{_apiBaseUrl}/assemblymonitor/PostManagerLine", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<MDManagerLineResponse>(responseContent, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    return result;
                }
                
                return new MDManagerLineResponse
                {
                    Msj = $"Error: {response.StatusCode}",
                    Result = "ERROR"
                };
            }
            catch (Exception ex)
            {
                return new MDManagerLineResponse
                {
                    Msj = $"Error: {ex.Message}",
                    Result = "ERROR"
                };
            }
        }

        public async Task<MDAssemblyMonitor> GetAssemblyMonitor(string plant, string lineIdCMS)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/assemblymonitor/GetAssemblyMonitor?plant={plant}&lineIdCMS={lineIdCMS}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var assemblyMonitor = JsonSerializer.Deserialize<MDAssemblyMonitor>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return assemblyMonitor;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener información del monitor de ensamblaje. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener información del monitor de ensamblaje: {ex.Message}");
                throw new Exception($"Error de conexión al obtener información del monitor de ensamblaje: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener información del monitor de ensamblaje: {ex.Message}");
                throw;
            }
        }
        
        public async Task<List<MDLineManager>> GetLineManager(string plant, string lineId)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrl}/assemblymonitor/GetLineManager?plant={plant}&line_id={lineId}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var lineManagers = JsonSerializer.Deserialize<List<MDLineManager>>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return lineManagers;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener información del gerente de línea. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener información del gerente de línea: {ex.Message}");
                throw new Exception($"Error de conexión al obtener información del gerente de línea: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener información del gerente de línea: {ex.Message}");
                throw;
            }
        }
        
        public async Task<MDLineDetail> GetLineDetail(string lineId)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlMch1}/line/GetLineDetail?line_id={lineId}";
                
                // Realizar la solicitud HTTP GET
                HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var lineDetail = JsonSerializer.Deserialize<MDLineDetail>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return lineDetail;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al obtener detalles de la línea. Código: {response.StatusCode}, Mensaje: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                // Manejar errores de conexión
                Console.WriteLine($"Error de conexión al obtener detalles de la línea: {ex.Message}");
                throw new Exception($"Error de conexión al obtener detalles de la línea: {ex.Message}", ex);
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
                Console.WriteLine($"Error al obtener detalles de la línea: {ex.Message}");
                throw;
            }
        }

        public async Task<MDUpdateLineResponse> UpdateLine(MDUpdateLineRequest request)
        {
            try
            {
                // Construir la URL completa para la solicitud
                string requestUrl = $"{_apiBaseUrlMch1}/line/UpdateLine";
                
                // Serializar el objeto de solicitud a JSON
                string jsonRequest = JsonSerializer.Serialize(request);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                
                // Realizar la solicitud HTTP PUT
                HttpResponseMessage response = await _httpClient.PutAsync(requestUrl, content);
                
                // Verificar si la solicitud fue exitosa
                if (response.IsSuccessStatusCode)
                {
                    // Leer y deserializar la respuesta
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    var updateLineResponse = JsonSerializer.Deserialize<MDUpdateLineResponse>(jsonResponse, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                     Console.WriteLine($"JSON RESPONSE: {jsonResponse}");
                    return updateLineResponse;
                }
                else
                {
                    // Manejar errores de la API
                    string errorContent = await response.Content.ReadAsStringAsync();
                    return new MDUpdateLineResponse
                    {
                        statusCode = 500,
                        message = "Error al actualizar la línea",
                        description = $"Error al actualizar la línea. Código: {response.StatusCode}, Mensaje: {errorContent}"
                    };
                }
            }
            catch (HttpRequestException ex)
            {
                return new MDUpdateLineResponse
                {
                    statusCode = 500,
                    message = "Error de conexión al actualizar la línea",
                    description = $"Error de conexión al actualizar la línea: {ex.Message}"
                };
            }
            catch (JsonException ex)
            {
                return new MDUpdateLineResponse
                {
                    statusCode = 500,
                    message = "ERROR",
                    description = $"Error al procesar la respuesta JSON: {ex.Message}"
                };
            }
            catch (Exception ex)
            {
                // Manejar otros errores
                Console.WriteLine($"Error al actualizar la línea: {ex.Message}");
                return new MDUpdateLineResponse
                {
                    statusCode = 500,
                    message = "ERROR",
                    description = $"Error al actualizar la línea: {ex.Message}"
                };
            }
        }
    }
}