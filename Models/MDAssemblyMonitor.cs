using System;

namespace AM_web.Models
{
    public class MDAssemblyMonitor
    {
        public string NombreLinea { get; set; }
        public string Fecha { get; set; }
        public string Hc { get; set; }
        public string Assittencia { get; set; }
        public string Lf { get; set; }
        public string Turno { get; set; }
        public string PlanPiezas { get; set; }
        public string NoParte { get; set; }
        public string MetaPiezasHr { get; set; }
        public string PiezasReal { get; set; }
        public string DiffPiezas { get; set; }
        public string ProductividadMeta { get; set; }
        public string ProductividadReal { get; set; }
        public string DiffProductividad { get; set; }
        public string DefectoDia { get; set; }
        public string DiasSinDefecto { get; set; }
        public string TMuerto { get; set; }
        public string Hora { get; set; }
        public string TTplan { get; set; }
        public string TTreal { get; set; }
    }
}