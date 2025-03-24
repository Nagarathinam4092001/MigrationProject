using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Migration_Project.Data;
using Migration_Project.Models;

namespace Migration_Project.Services
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly CustomerDbContext _context;

        public CustomerRepository(CustomerDbContext context)
        {
            _context = context;
        }

        public List<Customer> GetAll()
        {
            return _context.Customers.AsNoTracking().ToList();
        }

        public Customer FindById(long id)
        {
            return _context.Customers.Find(id);
        }

        public bool AddCustomer(Customer Customers)
        {
            _context.Customers.Add(Customers);
            return _context.SaveChanges() > 0;
        }

        public bool UpdateCustomer(Customer Customers)
        {
            _context.Customers.Update(Customers);
            return _context.SaveChanges() > 0;
        }

        public bool DeleteCustomer(long id)
        {
            var Customers = _context.Customers.Find(id);
            if (Customers != null)
            {
                _context.Customers.Remove(Customers);
                return _context.SaveChanges() > 0;
            }
            return false;
        }

        public bool UpdateCustomerImage(long id, byte[] imageData)
        {
            var customer = _context.Customers.Find(id);
            if (customer != null)
            {
                customer.CustomerImage = imageData;
                return _context.SaveChanges() > 0;
            }
            return false;
        }

        public long GetLastInsertedId()
        {
            // Get the last ID from the Customers table
            return _context.Customers.Max(c => c.CustomerID);
        }
    }
}
