using System.Threading.Tasks;
using AM_web.Models;

namespace AM_web.Services.Interfaces
{
    public interface IEmpleado
    {
        Task<MDEmployee> GetEmployee(string reloj);
        Task<MDEmployeeImage> GetEmployeeImage(string plant, string employee);
        Task<MDUser> GetUser(string plant, string userId);
    }
}