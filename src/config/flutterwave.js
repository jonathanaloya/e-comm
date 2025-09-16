// config/flutterwave.js
import FlutterwaveModule from "flutterwave-node-v3";

const Flutterwave = FlutterwaveModule.default || FlutterwaveModule;

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

export default flw;
