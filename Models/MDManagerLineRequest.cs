using System;

namespace AppManagementEnsableMonitor.Models
{
    public class MDManagerLineRequest
    {
        public string Plant { get; set; }
        public string LineId { get; set; }
        public string Type { get; set; }
        public string Employee { get; set; }
        public string RegisterUser { get; set; }
    }
}