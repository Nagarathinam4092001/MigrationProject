using Migration_Project.Models;

namespace Migration_Project.Services
{
    public interface ICustomerRepository
    {
        List<Customer> GetAll();
        Customer FindById(long Id);
        bool AddCustomer(Customer customer);
        bool UpdateCustomer(Customer customer);
        bool DeleteCustomer(long Id);
        bool UpdateCustomerImage(long id, byte[] imageData);
        long GetLastInsertedId();
    }
}
