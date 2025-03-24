using AutoMapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using Migration_Project.DTOs;
using Migration_Project.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Migration_Project.Services
{
    namespace ASPWebFormDapperDemo.Services
    {
        public class CustomerService
        {
            private readonly ICustomerRepository _repository;
            private readonly IMapper _mapper;

            public CustomerService(ICustomerRepository repository, IMapper mapper)
            {
                _repository = repository;
                _mapper = mapper;
            }
            public List<CustomerDTO> GetAll()
            {
                var customers = _repository.GetAll();
                var customerDtos = _mapper.Map<List<CustomerDTO>>(customers);            
                return customerDtos;
            }

            public List<CustomerDTO> GetAll(bool includeImages)
            {
                // Use AsNoTracking to improve performance when retrieving data
                var customers = _repository.GetAll();
                var customerDtos = _mapper.Map<List<CustomerDTO>>(customers);
                
                // Only process images if requested to improve performance
                if (includeImages)
                {
                    // Use parallel processing for better performance when handling many images
                    Parallel.ForEach(customers, customer =>
                    {
                        var dto = customerDtos.FirstOrDefault(d => d.CustomerID == customer.CustomerID);
                        if (dto != null && customer.CustomerImage != null && customer.CustomerImage.Length > 0)
                        {
                            try
                            {
                                dto.CustomerImageBase64 = Convert.ToBase64String(customer.CustomerImage);
                            }
                            catch (Exception)
                            {
                                // Ignore conversion errors and continue
                            }
                        }
                    });
                }
                        
                return customerDtos;
            }

            public CustomerDTO FindById(long id)
            {
                var customer = _repository.FindById(id);
                if (customer == null) return null;
                
                var customerDto = _mapper.Map<CustomerDTO>(customer);
                
                // Convert byte array to base64 string if image exists
                if (customer.CustomerImage != null)
                {
                    customerDto.CustomerImageBase64 = Convert.ToBase64String(customer.CustomerImage);
                }
                
                return customerDto;
            }


            public bool AddCustomer(CustomerDTO customerDto)
            {
                var customer = _mapper.Map<Customer>(customerDto);
                // Image conversion is now handled by the AutoMapper
                bool result = _repository.AddCustomer(customer);
                return result;
            }

            public bool UpdateCustomer(CustomerDTO customerDto)
            {
                var customer = _mapper.Map<Customer>(customerDto);
                // Image conversion is now handled by the AutoMapper
                bool result = _repository.UpdateCustomer(customer);
                return result;
            }

            // Delete a customer by ID
            public bool DeleteCustomer(long id)
            {
                bool result = _repository.DeleteCustomer(id);                            
                return result;
            }

            // Add method to handle image conversion and updates
            public bool UpdateCustomerImage(long id, string base64Image)
            {
                if (string.IsNullOrEmpty(base64Image))
                    return false;
                    
                try
                {
                    // Remove data:image/... prefix if present
                    var base64Data = base64Image;
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                    }
                    
                    var imageBytes = Convert.FromBase64String(base64Data);
                    return _repository.UpdateCustomerImage(id, imageBytes);
                }
                catch
                {
                    return false;
                }
            }

            // Get the last inserted ID - typically used after AddCustomer
            public long GetLastInsertedId()
            {
                return _repository.GetLastInsertedId();
            }

            // Add method to efficiently retrieve only the customer's image
            public string GetCustomerImage(long id)
            {
                var customer = _repository.FindById(id);
                if (customer == null || customer.CustomerImage == null || customer.CustomerImage.Length == 0)
                    return null;
                    
                try
                {
                    return Convert.ToBase64String(customer.CustomerImage);
                }
                catch
                {
                    return null;
                }
            }

        }
    }
}
