export class Customer {
  customerID: number;
  companyName: string;
  address: string;
  city: string;
  state: string;
  introDate: Date;
  creditLimit: number;
  customerImageBase64?: string;

  constructor(
    customerID: number,
    companyName: string,
    address: string,
    city: string,
    state: string,
    introDate: Date,
    creditLimit: number,
    customerImageBase64?: string
  ) {
    this.customerID = customerID;
    this.companyName = companyName;
    this.address = address;
    this.city = city;
    this.state = state;
    this.introDate = introDate;
    this.creditLimit = creditLimit;
    this.customerImageBase64 = customerImageBase64;
  }
}
