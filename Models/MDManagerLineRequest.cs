using System;

namespace AM_web.Models
{
    public class MDManagerLineRequest
    {
        public string Plant { get; set; }
        public string LineId { get; set; }

        public string shift { get; set; }
        public string Type { get; set; }
        public string Employee { get; set; }
        public string RegisterUser { get; set; }
    }
}