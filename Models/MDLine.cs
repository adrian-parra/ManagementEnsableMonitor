using System;

namespace AppManagementEnsableMonitor.Models
{
    public class MDLine
    {
        public string LineId { get; set; }
        public string WorkProccess { get; set; }
        public string TressId { get; set; }
        public string NombreLinea { get; set; }
        public string TerminalEmpaque { get; set; }
        public string FormacionPe { get; set; }
        public string MetaIPD { get; set; }
        public string LineId2 { get; set; }
        public int IdTipoConfiguracion { get; set; }
        public bool Estatus { get; set; }
    }
}