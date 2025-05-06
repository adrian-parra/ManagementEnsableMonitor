using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;

namespace AppManagementEnsableMonitor.Services.Interfaces
{
    public interface IAssemby
    {
        Task<List<MDPlant>> GetPlants();
        // Aquí puedes agregar otros métodos que necesites para tu aplicación
    }
}