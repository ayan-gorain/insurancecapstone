import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userPolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserPolicy",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        required: true,
        enum: ["CASH", "CARD", "BANK_TRANSFER", "ONLINE"]
    },
    reference: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING"
    },
    paymentType: {
        type: String,
        enum: ["POLICY_PURCHASE", "ADDITIONAL_PAYMENT", "CLAIM_PAYMENT"],
        default: "ADDITIONAL_PAYMENT"
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
