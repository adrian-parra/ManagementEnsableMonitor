using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AM_web.Models;

namespace AM_web.Services.Interfaces
{
    public interface IAssemby
    {
        Task<List<MDPlant>> GetPlants();
        Task<List<MDLine>> GetLines(string plantId);
        Task<MDUserDomain> GetUserDomain(string softwareName, string ipAdd);
        Task<MDImageCarResponse> PostImageCar(MDImageCarRequest request);
        Task<List<MDManagerType>> GetManagerType(string plant);
        Task<MDManagerLineResponse> PostManagerLine(MDManagerLineRequest request);
        Task<MDAssemblyMonitor> GetAssemblyMonitor(string plant, string lineIdCMS);
        Task<MDLineDetail> GetLineDetail(string lineId, string plant);
        Task<MDUpdateLineResponse> UpdateLine(MDUpdateLineRequest request);
        Task<List<MDLineManager>> GetLineManager(string plant, string lineId);
        Task<MDManagerLineResponse> DeleteManagerLine(string plant, string employee);
        Task<List<MDCustomer>> GetCustomer(string plant);
        Task<List<MDProject>> GetProjectByCustomer(string idCustomer, string plant);
        Task<MDImageCar> GetImageCar(string plant, string lineId);
        Task<MDImageMaylarResponse> PostImageMaylar(MDImageMaylarRequest request);
        Task<MDLineImageMaylar> GetLineImageMaylar(string plant, string lineId);
        Task<MDImageQaInvestigationResponse> PostImageQaInvestigation(MDImageQaInvestigationRequest request);
    }
}