using System.ComponentModel.DataAnnotations;

namespace AM_web.Models
{
    public class MDImageMaylarRequest
    {
        [Required(ErrorMessage = "La planta es requerida")]
        public string Plant { get; set; }
        
        [Required(ErrorMessage = "El ID de línea es requerido")]
        public string LineId { get; set; }
        
        [Required(ErrorMessage = "La imagen en Base64 es requerida")]
        public string ImageBase64 { get; set; }
        
        [Required(ErrorMessage = "El usuario registrador es requerido")]
        public string RegisterUser { get; set; }
    }
}