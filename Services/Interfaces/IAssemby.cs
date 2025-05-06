using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;

namespace AppManagementEnsableMonitor.Services.Interfaces
{
    public interface IAssemby
    {
        Task<List<MDPlant>> GetPlants();
        Task<List<MDLine>> GetLines(string plantId);
        Task<MDUserDomain> GetUserDomain(string softwareName, string ipAdd);
        // Aquí puedes agregar otros métodos que necesites para tu aplicación
    }
}