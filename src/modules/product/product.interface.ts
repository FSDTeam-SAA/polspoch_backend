export interface IProduct {
  productName: string;
  description: string;
  inStock: boolean;
  images: {
    public_id: string;
    url: string;
  }[];
  longestSide: number[];
  shortestSide: number[];
  thickness: number[];
  long: number[];
  finish: string[];
  quality: string[];
  price: number;
  manufacturingProcess: string;
  productInfo: {
    title: string;
    description: string;
  }[];
  technicalInfo: {
    title: string;
    description: string;
  }[];
}
