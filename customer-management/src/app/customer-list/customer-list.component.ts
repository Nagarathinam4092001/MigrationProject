import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../customer.service';
import { Customer } from '../Models/customer.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
  imports: [FormsModule, CommonModule]
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  editingCustomer: Customer | null = null;
  originalCustomer: Customer | null = null;
  formattedCreditLimit: string = '';
  selectedFile: File | null = null;
  
  // Image lazy loading properties
  loadedImages: {[id: number]: string} = {};
  isLoadingImage: {[id: number]: boolean} = {};

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCustomers();
    this.customerService.getCustomersUpdatedListener().subscribe((customers: Customer[]) => {
      this.customers = customers;
    });
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.customers = response.body || [];
          // Clean up image tracking objects when the list changes
          this.loadedImages = {};
          this.isLoadingImage = {};
        } else {
          this.toastr.error('Failed to load customers.', 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to load customers.', 'Error');
      }
    });
  }

  // Load a specific customer's image on demand
  loadCustomerImage(customerId: number) {
    // Skip if already loading or loaded
    if (this.isLoadingImage[customerId] || this.loadedImages[customerId]) {
      return;
    }
    
    this.isLoadingImage[customerId] = true;
    
    this.customerService.getCustomerImage(customerId)
      .pipe(
        finalize(() => {
          this.isLoadingImage[customerId] = false;
        })
      )
      .subscribe({
        next: (imageBase64) => {
          if (imageBase64) {
            this.loadedImages[customerId] = imageBase64;
          }
        },
        error: (error) => {
          console.error('Error loading customer image:', error);
        }
      });
  }

  startEdit(customer: Customer) {
    // Create deep copy of customer to edit
    this.originalCustomer = { ...customer };
    this.editingCustomer = { ...customer };
    
    // If we have a loaded image for this customer, use it
    if (this.loadedImages[customer.customerID]) {
      this.editingCustomer.customerImageBase64 = this.loadedImages[customer.customerID];
    }
    // Otherwise, load the image if needed
    else if (customer.customerID) {
      this.loadCustomerImage(customer.customerID);
    }
    
    // Format credit limit to show two decimal places
    this.formatCreditLimit();
    
    // Handle date conversion for proper date input
    if (this.editingCustomer.introDate) {
      this.editingCustomer.introDate = this.formatDate(customer.introDate);
    }
  }

  cancelEdit() {
    this.editingCustomer = null;
    this.originalCustomer = null;
    this.formattedCreditLimit = '';
    this.selectedFile = null;
    this.toastr.info('Edit canceled', 'Information', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      progressBar: true
    });
  }

  updateCustomer() {
    if (!this.editingCustomer) return;
    
    // Apply the formatted credit limit
    this.onCreditLimitBlur();
    
    // Validate data
    if (this.editingCustomer.creditLimit <= 0) {
      this.toastr.error('Credit Limit must be greater than zero.', 'Error');
      return;
    }

    const customerId = this.editingCustomer.customerID;
    
    this.customerService.updateCustomer(customerId, this.editingCustomer).subscribe({
      next: (response) => {
        if (response.status === 200 && response.body?.message === "Successfully Updated the record") {
          this.toastr.success('Customer updated successfully!', 'Success', {
            timeOut: 1000,
            positionClass: 'toast-bottom-right',
            progressBar: true
          });
          
          // Update the loaded image if it's changed
          if (this.editingCustomer?.customerImageBase64) {
            this.loadedImages[customerId] = this.editingCustomer.customerImageBase64;
          }
          
          // Reset the editing state without showing the cancel message
          this.resetEditState();
          
          // Clear cache and reload the list
          this.customerService.clearCache();
          this.loadCustomers();
        } else {
          this.toastr.error('Failed to update customer.', 'Error');
        }
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.toastr.error('Failed to update customer.', 'Error');
      }
    });
  }

  // New method to handle file selection for image upload
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    
    if (this.selectedFile && this.editingCustomer) {
      // Validate file size before processing
      if (this.selectedFile.size > 5000000) { // 5MB limit
        this.toastr.warning('Image is too large. Please select an image under 5MB.', 'Warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        // Store just the base64 data part (without the data:image/jpeg;base64, prefix)
        if (this.editingCustomer) {
          this.editingCustomer.customerImageBase64 = base64String.split(',')[1];
          console.log('Image converted to base64');
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // New method to reset edit state without showing the cancel message
  resetEditState() {
    this.editingCustomer = null;
    this.originalCustomer = null;
    this.formattedCreditLimit = '';
    this.selectedFile = null;
  }

  deleteCustomer(id: number) {
    this.customerService.deleteCustomer(id).subscribe({
      next: (response) => {
        if (response.status === 200 && response.body?.message === "Successfully deleted the record") {
          this.toastr.success('Customer deleted successfully!', 'Success', {
            timeOut: 1000,
            positionClass: 'toast-bottom-right',
            progressBar: true
          });
          
          // Clean up the image cache for this customer
          delete this.loadedImages[id];
          delete this.isLoadingImage[id];
          
          // Clear cache and reload the list
          this.customerService.clearCache();
          this.loadCustomers();
        } else {
          this.toastr.error('Failed to delete customer.', 'Error');
        }
      },
      error: (error) => {
        console.error('Error deleting customer:', error);
        this.toastr.error('Failed to delete customer.', 'Error');
      }
    });
  }

  navigateToAddCustomer() {
    this.router.navigate(['/add-customer']);
  }

  formatDate(dateToFormat: Date): Date {
    if (!dateToFormat) return new Date();
    
    const date = new Date(dateToFormat);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return new Date(formattedDate);
  }

  // Format credit limit with two decimal places
  formatCreditLimit() {
    if (this.editingCustomer && this.editingCustomer.creditLimit !== undefined) {
      // Format to 2 decimal places as a string to preserve trailing zeros
      this.formattedCreditLimit = this.editingCustomer.creditLimit.toFixed(2);
    }
  }

  // Handle credit limit input blur event
  onCreditLimitBlur() {
    if (this.formattedCreditLimit && this.editingCustomer) {
      // Parse the formatted value back to a number for the model
      const value = parseFloat(this.formattedCreditLimit);
      if (!isNaN(value)) {
        this.editingCustomer.creditLimit = value;
        // Re-format to ensure it displays with 2 decimal places
        this.formattedCreditLimit = value.toFixed(2);
      }
    }
  }
}