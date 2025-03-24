import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../customer.service';
import { Customer } from '../Models/customer.model';
import { FormsModule, NgForm } from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerListComponent } from "../customer-list/customer-list.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
  imports: [FormsModule, CommonModule, CustomerListComponent]
})
export class CustomerFormComponent implements OnInit{
  @ViewChild('customerForm') customerForm!: NgForm;
  customerId: number | null = null;
  customers: Customer[] = [];
  customer: Customer = new Customer(0, '', '', '', '', new Date(), 0, undefined);
  submitted = false;
  private routeSub: Subscription = new Subscription();
  selectedFile: File | null = null;
  selectedFileName: string = '';
  
  constructor(private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.customerId = Number(params['id']) || null;
      this.customerId ? this.loadCustomer(this.customerId) : this.loadCustomers();
    });
  }
          
  loadCustomer(id: number): void {
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        if (customer.introDate) {
          customer.introDate = this.formatDate(customer.introDate);
        }
        this.customer = customer;
      },
      error: (error) => {
        console.error('Error loading customer:', error); 
        this.toastr.error('Failed to load customer details.', 'Error');
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (response) => {
        this.customers = response.body || [];
        this.customerService.notifyCustomersUpdated(this.customers);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.toastr.error('Failed to load customers.', 'Error');
      }
    });
  }
  
  onSubmit(): void {
    if (this.customerForm.valid) {
      this.submitted = true;
      
      console.log('Submitting customer with image:', this.customer.customerImageBase64 ? 'Image data present' : 'No image');
      
      if (this.customerId) {
        // Update existing customer
        this.customerService.updateCustomer(this.customerId, this.customer).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastr.success('Customer updated successfully!');
              this.resetForm();
              this.loadCustomers();
            }
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            this.toastr.error('Failed to update customer.');
          }
        });
      } else {
        // Add new customer
        this.customerService.addCustomer(this.customer).subscribe({
          next: (response) => {
            if (response.status === 200) {
              const newCustomerId = response.body?.customerId || response.body?.customerID || 0;
              this.toastr.success('Customer added successfully!');
              this.resetForm();
              this.loadCustomers();
            }
          },
          error: (error) => {
            console.error('Error adding customer:', error);
            this.toastr.error('Failed to add customer.');
          }
        });
      }
    }
  }

  uploadImageIfNeeded(customerId: number) {
    if (this.selectedFile && !this.customer.customerImageBase64) {
      // We need to read the file again since this is a separate request
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result.split(',')[1];
        this.customerService.uploadCustomerImage(customerId, base64Image).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastr.success('Image uploaded successfully!');
            }
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.toastr.error('Failed to upload image.');
          }
        });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  resetForm(): void {
    this.customer = new Customer(0, '', '', '', '', new Date(), 0, undefined);
    this.customerId = null;
    this.submitted = false;
    this.selectedFile = null;
    this.selectedFileName = '';
    if (this.customerForm) {
      this.customerForm.resetForm();
    }
  }

  // Helper method to format date to yyyy-MM-dd format
  formatDate(dateToFormat: Date): Date {
    if (!dateToFormat) return new Date();
    
    const date = new Date(dateToFormat);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return new Date(formattedDate);
  }

  triggerFileInput() {
    document.getElementById('customerImage')?.click();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.selectedFileName = this.selectedFile?.name || '';
    
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        // Just store the base64 data part (without the data:image/jpeg;base64, prefix)
        this.customer.customerImageBase64 = base64String.split(',')[1];
        console.log('Image converted to base64');
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}