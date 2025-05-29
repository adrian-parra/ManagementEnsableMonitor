using System;

namespace AM_web.Models
{
    public class MDImageCarRequest
    {
        public string Plant { get; set; }
        public string LineId { get; set; }
        public string ImageBase64 { get; set; }
        public string RegisterUser { get; set; }
    }
}