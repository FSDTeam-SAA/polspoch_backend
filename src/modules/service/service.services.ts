import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/cloudinary";
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

//! pagination,searching,sorting and filtering is not completed
const getAllServices = async () => {
  const result = await Service.find();
  return result;
};

const getSingleService = async (serviceId: string) => {
  const existingService = await Service.findById(serviceId);
  if (!existingService)
    throw new AppError("Service not found", StatusCodes.NOT_FOUND);

  const result = await Service.findById(serviceId);
  return result;
};

const updateService = async (
  payload: IService,
  serviceId: string,
  files: any
) => {
  const existingService = await Service.findById(serviceId);
  if (!existingService)
    throw new AppError("Service not found", StatusCodes.NOT_FOUND);

  // Keep existing arrays as default
  let images: { public_id: string; url: string }[] =
    Array.isArray(existingService.images) ? existingService.images : [];
  let technicalImages: { public_id: string; url: string }[] = [];

  const serviceImages = files?.images || [];
  const techImages = files?.technicalImages || [];

  // ----- Upload new main service images -----
  if (serviceImages.length > 0) {
    // Optional: delete old ones
    await Promise.all(images.map((img) => deleteFromCloudinary(img.public_id)));

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

  // ----- Upload new technical images -----
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

  // ----- Merge technical info -----
  let updatedTechnicalInfo = existingService.technicalInfo || [];

  if (payload.technicalInfo && payload.technicalInfo.length > 0) {
    updatedTechnicalInfo = payload.technicalInfo.map(
      (info: any, index: number) => {
        const oldImages = existingService.technicalInfo[index]?.images || [];

        return {
          ...info,
          images:
            technicalImages.length > 0
              ? technicalImages // ✅ use all new uploaded tech images
              : oldImages, // keep old if none uploaded
        };
      }
    );
  }

  // ----- Update the service -----
  const updatedService = await Service.findByIdAndUpdate(
    serviceId,
    {
      ...payload,
      images, // ✅ update main images properly
      technicalInfo: updatedTechnicalInfo, // ✅ update tech info properly
    },
    { new: true, runValidators: true }
  );

  return updatedService;
};



const serviceServices = {
  createNewService,
  getAllServices,
  getSingleService,
  updateService,
};

export default serviceServices;
