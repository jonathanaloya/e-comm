import flutterwave from 'flutterwave-node-v3';

const flutterwaveInstance = new flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY,
);

export default flutterwaveInstance