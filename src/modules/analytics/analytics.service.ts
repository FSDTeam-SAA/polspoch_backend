import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";

const getAnalytics = async () => {
  const productCount = await Product.countDocuments({
    availabilityNote: "In Stock",
  });

  const totalUser = await User.countDocuments({ isVerified: true });

  const orders = await Order.find()
    .populate({ path: "product.productId", select: "price" })
    .populate({
      path: "cartItems.cartId",
      populate: { path: "product.productId serviceId" },
    })
    .lean();

  let totalAmount = 0;
  let totalProductSell = 0;
  //   let totalServiceSell = 0;

  orders.forEach((order: any) => {
    // Direct product orders
    if (order.product?.productId) {
      totalAmount += order.totalAmount || 0;
      totalProductSell += order.quantity || 1; // assuming 'quantity' field exists in direct product order
    }

    // Cart orders
    if (order.type === "cart" && order.cartItems?.length > 0) {
      order.cartItems.forEach((item: any) => {
        const cart = item.cartId;
        if (!cart) return;

        // Product inside cart
        if (cart.type === "product" && cart.product?.productId?.price) {
          totalAmount +=
            (cart.product.productId.price || 0) * (cart.quantity || 1);
          totalProductSell += cart.quantity || 1;
        }

        // Service inside cart
        // if (cart.type === "service" && cart.service?.price) {
        //   totalAmount += (cart.service.price || 0) * (cart.quantity || 1);
        //   totalServiceSell += cart.quantity || 1;
        // }
      });
    }
  });

  return {
    productCount,
    totalUser,
    totalAmount,
    totalProductSell,
    // totalServiceSell,
  };
};

const getChartData = async (year?: number) => {
  const selectedYear = year || new Date().getFullYear(); // default to current year

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const result = await Order.aggregate([
    // Filter by year and only paid orders
    {
      $match: {
        paymentStatus: "paid",
        purchaseDate: {
          $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    // Unwind cart items for cart orders
    {
      $unwind: {
        path: "$cartItems",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Add item type, quantity, and amount
    {
      $addFields: {
        itemType: {
          $cond: [
            { $eq: ["$cartItems.cartId.type", "service"] },
            "service",
            {
              $cond: [
                { $eq: ["$cartItems.cartId.type", "product"] },
                "product",
                "directProduct",
              ],
            },
          ],
        },
        itemQuantity: {
          $cond: [
            { $eq: ["$cartItems.cartId.type", "service"] },
            "$cartItems.cartId.quantity",
            {
              $cond: [
                { $eq: ["$cartItems.cartId.type", "product"] },
                "$cartItems.cartId.quantity",
                "$quantity",
              ],
            },
          ],
        },
        itemAmount: {
          $cond: [
            { $eq: ["$cartItems.cartId.type", "service"] },
            {
              $multiply: [
                "$cartItems.cartId.service.price",
                "$cartItems.cartId.quantity",
              ],
            },
            {
              $cond: [
                { $eq: ["$cartItems.cartId.type", "product"] },
                {
                  $multiply: [
                    "$cartItems.cartId.product.productId.price",
                    "$cartItems.cartId.quantity",
                  ],
                },
                "$totalAmount",
              ],
            },
          ],
        },
      },
    },
    // Group by month
    {
      $group: {
        _id: { month: { $month: "$purchaseDate" } },
        totalAmount: { $sum: "$itemAmount" },
        totalProductSell: {
          $sum: {
            $cond: [{ $eq: ["$itemType", "product"] }, "$itemQuantity", 0],
          },
        },
        totalServiceSell: {
          $sum: {
            $cond: [{ $eq: ["$itemType", "service"] }, "$itemQuantity", 0],
          },
        },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // Map result to months, fill missing months with zeros
  const chartData = months.map((monthName, index) => {
    const monthData = result.find((r) => r._id.month === index + 1);
    return {
      month: monthName,
      totalAmount: monthData?.totalAmount || 0,
      totalProductSell: monthData?.totalProductSell || 0,
      totalServiceSell: monthData?.totalServiceSell || 0,
    };
  });

  return chartData;
};



const analyticsService = {
  getAnalytics,
  getChartData,
};

export default analyticsService;
