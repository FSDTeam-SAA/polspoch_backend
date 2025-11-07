import { uploadToCloudinary } from "../../utils/cloudinary";
import { IService } from "./service.interface";
import { Service } from "./service.model";

const createNewService = async (payload: IService, files: any) => {
  let images: { public_id: string; url: string }[] = [];
  let technicalImages: { public_id: string; url: string }[] = [];

  const serviceImages = files?.images || [];
  const techImages = files?.technicalImages || [];

  if (serviceImages.length > 0) {
    const uploadResults = await Promise.all(
      serviceImages.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.path, "services")
      )
    );

    images = uploadResults.map((uploaded: any) => ({
      public_id: uploaded.public_id ?? "",
      url: uploaded.secure_url,
    }));
  }

  if (techImages.length > 0) {
    const techUploadResults = await Promise.all(
      techImages.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.path, "technicalInfo")
      )
    );

    technicalImages = techUploadResults.map((uploaded: any) => ({
      public_id: uploaded.public_id ?? "",
      url: uploaded.secure_url,
    }));
  }

  let technicalInfo = [];
  if (payload.technicalInfo && payload.technicalInfo.length > 0) {
    technicalInfo = payload.technicalInfo.map((info: any) => ({
      ...info,
      images: technicalImages,
    }));
  }

  const newService = await Service.create({
    ...payload,
    images,
    technicalInfo,
  });

  return newService;
};

const serviceServices = {
  createNewService,
};

export default serviceServices;
