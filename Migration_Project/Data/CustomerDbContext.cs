using Microsoft.EntityFrameworkCore;
using Migration_Project.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection.Emit;

namespace Migration_Project.Data
{
    public class CustomerDbContext : DbContext
    {
        public CustomerDbContext(DbContextOptions<CustomerDbContext> options): base(options)
        {
        }

        public DbSet<Customer> Customers { get; set; }

    }
}
