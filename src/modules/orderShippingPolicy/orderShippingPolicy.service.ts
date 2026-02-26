import { IOrderShippingPolicy } from "./orderShippingPolicy.interface";
import orderShippingPolicy from "./orderShippingPolicy.model";

const createOrderShippingPolicy = async (payload: IOrderShippingPolicy) => {
  const result = await orderShippingPolicy.create(payload);
  return result;
};

const getOrderShippingPolicy = async () => {
  const result = await orderShippingPolicy.find();
  return result;
};

const updateOrderShippingPolicy = async (
  id: string,
  payload: Partial<IOrderShippingPolicy>,
) => {
  const result = await orderShippingPolicy.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteOrderShippingPolicy = async (id: string) => {
  //   const result = await orderShippingPolicy.findByIdAndDelete(id);
  //   return result;

  throw new Error("O dada dhoner pataaa 🫰🖕😬..........");
};

const orderShippingPolicyService = {
  createOrderShippingPolicy,
  getOrderShippingPolicy,
  updateOrderShippingPolicy,
  deleteOrderShippingPolicy,
};

export default orderShippingPolicyService;
