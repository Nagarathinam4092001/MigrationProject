using AutoMapper;
using Migration_Project.DTOs;
using Migration_Project.Models;
using System;

namespace Migration_Project.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Define a mapping between Customer and CustomerDto
            CreateMap<Customer, CustomerDTO>();
            
            // Define mapping from DTO to Customer with special handling for the image
            CreateMap<CustomerDTO, Customer>()
                .ForMember(dest => dest.CustomerImage, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.CustomerImageBase64) 
                        ? null 
                        : Convert.FromBase64String(src.CustomerImageBase64)));
        }
    }
}
