namespace Migration_Project.DTOs
{
    public class CustomerDTO
    {
        public long CustomerID { get; set; }
        public string Address { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public DateTime IntroDate { get; set; }
        public decimal CreditLimit { get; set; }
        public string? CustomerImageBase64 { get; set; }
    }
}
