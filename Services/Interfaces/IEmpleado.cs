using System.Threading.Tasks;
using AppManagementEnsableMonitor.Models;

namespace AppManagementEnsableMonitor.Services.Interfaces
{
    public interface IEmpleado
    {
        Task<MDEmployee> GetEmployee(string reloj);
        Task<MDEmployeeImage> GetEmployeeImage(string plant, string employee);
        Task<MDUser> GetUser(string plant, string userId);
    }
}