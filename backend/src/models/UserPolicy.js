import mongoose from "mongoose";

const userPolicySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    policyProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PolicyProduct",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    premiumPaid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
        default: "ACTIVE"
    },
    nominee: {
        type: String,
        required: true
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

const UserPolicy = mongoose.model("UserPolicy", userPolicySchema);

export default UserPolicy;
