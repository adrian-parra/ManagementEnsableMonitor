using System;

namespace AppManagementEnsableMonitor.Models
{
    public class MDUpdateLineRequest
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
        public string NumeroParte { get; set; }
        public string MetaProductividad { get; set; }
        public string Descripcion { get; set; }
        public string Customer { get; set; }
        public string Project { get; set; }
        public string Comunizada { get; set; }
    }
}