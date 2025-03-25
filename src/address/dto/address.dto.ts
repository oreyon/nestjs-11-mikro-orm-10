export class CreateAddressReq {
  constructor(
    contactId: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.contactId = contactId;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  contactId: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class CreateAddressRes {
  constructor(
    id: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.id = id;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class GetAddressReq {
  constructor(contactId: number, addressId: number) {
    this.contactId = contactId;
    this.addressId = addressId;
  }

  contactId: number;
  addressId: number;
}

export class GetAddressRes {
  constructor(
    id: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.id = id;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class UpdateAddressReq {
  constructor(
    id: number,
    contactId: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.id = id;
    this.contactId = contactId;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  id: number;
  contactId: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class UpdateAddressRes {
  constructor(
    id: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.id = id;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class RemoveAddressReq {
  constructor(contactId: number, addressId: number) {
    this.contactId = contactId;
    this.addressId = addressId;
  }

  contactId: number;
  addressId: number;
}

export class RemoveAddressRes {
  constructor(
    id: number,
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.id = id;
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}
