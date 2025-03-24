using System.ComponentModel.DataAnnotations;

namespace Migration_Project.Models
{
    public class Customer
    {
        public long CustomerID { get; set; }
        public string Address { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public DateTime IntroDate { get; set; }
        public decimal CreditLimit { get; set; }
        public byte[]? CustomerImage { get; set; }
    }
}
