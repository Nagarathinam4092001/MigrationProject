import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, forkJoin, of } from 'rxjs';
import { Customer } from './Models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'https://localhost:7000/api/customer'; // Update with your API URL
  private customersUpdated = new Subject<Customer[]>();
  private cachedCustomers: Customer[] | null = null;
  private lastFetch = 0;
  private cacheDuration = 30000; // 30 seconds cache

  constructor(private http: HttpClient) {}

  getAllCustomers(forceRefresh = false): Observable<HttpResponse<Customer[]>> {
    const now = Date.now();
    // Use cached data if available and not expired
    if (!forceRefresh && this.cachedCustomers && (now - this.lastFetch < this.cacheDuration)) {
      return of(new HttpResponse({
        body: this.cachedCustomers,
        status: 200
      }));
    }

    // By default don't include images in the list view to improve performance
    // Images will be loaded on demand when needed
    const params = new HttpParams().set('includeImages', 'false');
    
    return this.http.get<Customer[]>(`${this.apiUrl}`, { 
      observe: 'response',
      params
    }).pipe(
      map(response => {
        if (response.body) {
          this.cachedCustomers = response.body;
          this.lastFetch = Date.now();
        }
        return response;
      })
    );
  }

  addCustomer(customer: Customer): Observable<HttpResponse<any>> {
    // Compress image if present
    if (customer.customerImageBase64) {
      customer.customerImageBase64 = this.compressImageIfNeeded(customer.customerImageBase64);
    }
    return this.http.post(`${this.apiUrl}/add`, customer, { observe: 'response' })
      .pipe(map(response => {
        // Clear cache on successful modification
        this.cachedCustomers = null;
        return response;
      }));
  }

  updateCustomer(id: number, customer: Customer): Observable<HttpResponse<any>> {
    // Compress image if present
    if (customer.customerImageBase64) {
      customer.customerImageBase64 = this.compressImageIfNeeded(customer.customerImageBase64);
    }
    return this.http.put(`${this.apiUrl}/update/${id}`, customer, { observe: 'response' })
      .pipe(map(response => {
        // Clear cache on successful modification
        this.cachedCustomers = null;
        return response;
      }));
  }

  getCustomerById(id: number): Observable<Customer> {
    // Check if we have it in the cache
    if (this.cachedCustomers) {
      const cachedCustomer = this.cachedCustomers.find(c => c.customerID === id);
      if (cachedCustomer && cachedCustomer.customerImageBase64) {
        return of(cachedCustomer);
      }
    }
    
    return this.http.get<Customer>(`${this.apiUrl}/get/${id}`);
  }

  deleteCustomer(id: number): Observable<HttpResponse<any>> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { observe: 'response' })
      .pipe(map(response => {
        // Clear cache on successful modification
        this.cachedCustomers = null;
        return response;
      }));
  }

  getCustomerImage(id: number): Observable<string | null> {
    // If it's in the cache, retrieve it from there
    if (this.cachedCustomers) {
      const cachedCustomer = this.cachedCustomers.find(c => c.customerID === id);
      if (cachedCustomer && cachedCustomer.customerImageBase64) {
        return of(cachedCustomer.customerImageBase64);
      }
    }
    
    // Otherwise, fetch it from the dedicated image endpoint for better performance
    return this.http.get<any>(`${this.apiUrl}/image/${id}`).pipe(
      map(response => response?.imageBase64 || null)
    );
  }
  
  // Helper method to compress base64 image data
  private compressImageIfNeeded(base64String: string): string {
    // Only compress if it's larger than 100KB
    if (base64String.length > 100000) {
      // For simplicity, we'll just return the string as is
      // In a real application you would implement actual compression here
      console.log('Image compression would happen here');
    }
    return base64String;
  }

  notifyCustomersUpdated(customers: Customer[]) {
    this.customersUpdated.next(customers);
  }

  getCustomersUpdatedListener(): Observable<Customer[]> {
    return this.customersUpdated.asObservable();
  }

  uploadCustomerImage(id: number, imageBase64: string): Observable<HttpResponse<any>> {
    // Compress image before uploading
    const compressedImage = this.compressImageIfNeeded(imageBase64);
    
    return this.http.post(`${this.apiUrl}/uploadImage/${id}`, { imageBase64: compressedImage }, { observe: 'response' })
      .pipe(map(response => {
        // Clear cache on successful modification
        this.cachedCustomers = null;
        return response;
      }));
  }

  // Clear the cache manually
  clearCache() {
    this.cachedCustomers = null;
    this.lastFetch = 0;
  }
}
