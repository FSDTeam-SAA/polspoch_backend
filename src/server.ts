import http from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import {startStripePendingPaymentsJob} from './modules/payment/confirmPayment'

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mogodbUrl as string);
    console.log(" MongoDB connected");
      // Start the cron job only after DB is ready
    startStripePendingPaymentsJob();
    console.log("✅ Stripe pending payments cron job started");
    const httpServer = http.createServer(app);

    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

main();
