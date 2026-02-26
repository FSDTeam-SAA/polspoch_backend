export interface IOrderShippingPolicy {
  shippingMethod: string;
  limits: string;
  minPrice: number;
  Extras: string;
  maxPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
