import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PolicyProduct",
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
        enum: ["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PAYPAL"],
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    
    cardNumber: {
        type: String,
        required: false,
        select: false
    },
    upiId: {
        type: String,
        required: false,
        select: false
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
        default: "PENDING"
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

paymentSchema.pre('save', function(next) {
    this.cardNumber = undefined;
    this.upiId = undefined;
    next();
});


paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
