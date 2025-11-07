export interface IService {
  serviceName: string;
  description: string;
  images: {
    public_id: string;
    url: string;
  };
  material: string[];
  thickness: number[];
  aLength?: string;
  bLength?: string;
  cLength?: string;
  dLength?: string;
  eLength?: string;
  fLength?: string;

  serviceInfo: {
    title: string;
    description: string;
  }[];

  technicalInfo: {
    title?: string;
    minimumDimension?: string;
    thickness?: string;
    look?: string;
    application?: string;
    defect?: string;
    reference?: string;
    technicalSheet?: string;
    images?: {
      public_id: string;
      url: string;
    }[];
  }[];
}
