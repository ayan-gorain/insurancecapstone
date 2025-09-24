import mongoose from "mongoose";

const policyProductSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    premium: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    minSumInsured: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const PolicyProduct = mongoose.model("PolicyProduct", policyProductSchema);

export default PolicyProduct;
