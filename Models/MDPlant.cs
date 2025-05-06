using System;
using System.Collections.Generic;

namespace AppManagementEnsableMonitor.Models
{
    public class MDPlant
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string CodigoTress { get; set; }
        public string CheckadoresDePlanta { get; set; }
        public List<string> Checadores { get; set; }
    }
}