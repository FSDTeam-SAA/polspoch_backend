import { IService } from "./service.interface";
import Service from "./service.model";

class ServiceService {
  /**
   * Create a new service (rebar, bending, or cutting)
   * @param data - IService object
   * @returns Created service document
   */
  async createService(data: IService) {
    const service = new Service(data);
    return await service.save();
  }

  /**
   * Get all services or filter by serviceType
   * @param serviceType Optional filter
   * @returns Array of services
   */
  async getServices(serviceType?: "rebar" | "bending" | "cutting") {
    const query = serviceType ? { serviceType } : {};
    return await Service.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get a single service by ID
   * @param id Service ID
   * @returns Service document or null
   */
  async getServiceById(id: string) {
    return await Service.findById(id);
  }

  /**
   * Get all services for a specific user
   * @param userId User ID
   * @returns Array of services for that user
   */
  async getServicesByUserId(userId: string) {
    return await Service.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName email");
  }
}

export default new ServiceService();
