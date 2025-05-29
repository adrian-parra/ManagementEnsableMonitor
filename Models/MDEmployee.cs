using System;

namespace AM_web.Models
{
    public class MDEmployee
    {
        public string Reloj { get; set; }
        public string Nombre { get; set; }
        public string TresId { get; set; }
        public string Turno { get; set; }
        public string Tipo { get; set; }
        public string Estatus { get; set; }
        public DateTime FechaIngreso { get; set; }
        public bool Asistencia { get; set; }
        public string Antiguedad { get; set; }
        public int DiasAntiguedad { get; set; }
        public DateTime HoraEntrada { get; set; }
        public int EstadoChecada { get; set; }
        public string ErrorMsj { get; set; }
    }
}