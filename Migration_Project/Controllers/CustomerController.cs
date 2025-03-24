using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Migration_Project.DTOs;
using Migration_Project.Models;
using Migration_Project.Services;
using Migration_Project.Services.ASPWebFormDapperDemo.Services;

namespace Migration_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomerController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        // GET: api/customer
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<CustomerDTO>> GetAll([FromQuery] bool includeImages = false)
        {
            try
            {
                var customers = _customerService.GetAll(includeImages);
                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "Error retrieving customers", error = ex.Message });
            }
        }


        [HttpGet("get/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<CustomerDTO> GetCustomerById(long id)
        {
            var customer = _customerService.FindById(id);
            if (customer != null)
            {
                return Ok(customer);
            }
            return NotFound("Customer not found");
        }

        // POST: api/customer/add
        [HttpPost("add")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult AddCustomer([FromBody] CustomerDTO customerDto)
        {
            var result = _customerService.AddCustomer(customerDto);
            if (result)
            {
                // Try to get the last inserted ID
                var lastId = _customerService.GetLastInsertedId();
                return Ok(new { message = "Successfully added the record", customerId = lastId });
            }
            return BadRequest(new { message = "Failed to add the record" });
        }

        // PUT: api/customer/update/{id}
        [HttpPut("update/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult UpdateCustomer(long id, [FromBody] CustomerDTO customerDto)
        {
            customerDto.CustomerID = id;
            var result = _customerService.UpdateCustomer(customerDto);
            if (result)
                return Ok(new { message = "Successfully Updated the record" });
            return BadRequest(new { message = "Failed to Update the record" });
        }

        // DELETE: api/customer/delete/{id}
        [HttpDelete("delete/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult DeleteCustomer(long id)
        {
            var result = _customerService.DeleteCustomer(id);
            if (result)
                return Ok(new { message = "Successfully deleted the record" });
            return BadRequest(new { message = "Failed to delete record" });
        }

        // POST: api/customer/edit/{id}
        [HttpPost("edit/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult EditCustomer(long id, [FromBody] CustomerDTO customerDto)
        {
            customerDto.CustomerID = id;
            var result = _customerService.UpdateCustomer(customerDto);
            if (result)
                return Ok("Successfully edited the record");
            return BadRequest("Failed to edit record");
        }

        // POST: api/customer/cancelEdit
        [HttpPost("cancelEdit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult CancelEdit()
        {
            // Logic to handle cancel edit, if needed
            return Ok("Edit cancelled");
        }

        // POST: api/customer/pageIndexChange
        [HttpPost("pageIndexChange")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult PageIndexChange(int newIndex)
        {
            // Logic to handle page index change, if needed
            return Ok("Page index changed");
        }

        // POST: api/customer/uploadImage/{id}
        [HttpPost("uploadImage/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult UploadCustomerImage(long id, [FromBody] ImageUploadModel model)
        {
            if (model == null || string.IsNullOrEmpty(model.ImageBase64))
            {
                return BadRequest("No image data provided");
            }
            
            try
            {
                var result = _customerService.UpdateCustomerImage(id, model.ImageBase64);
                if (result)
                    return Ok(new { message = "Image uploaded successfully" });
                return BadRequest(new { message = "Failed to upload image" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "Error uploading image", error = ex.Message });
            }
        }

        // GET: api/customer/image/{id}
        [HttpGet("image/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult GetCustomerImage(long id)
        {
            try
            {
                var imageData = _customerService.GetCustomerImage(id);
                if (imageData != null)
                {
                    return Ok(new { imageBase64 = imageData });
                }
                return NotFound(new { message = "Image not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = "Error retrieving image", error = ex.Message });
            }
        }
    }
 
}
