import PolicyProduct from "../models/PolicyProduct.js";
import User from "../models/User.js";
import Claim from "../models/Claim.js";
import cloudinary from "../config/cloudinary.js";
import AuditLog from "../models/Auditlog.js";
export const createPolicy = async (req, res) => {
  try {
    const { code, title, description, premium, termMonths, minSumInsured, image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Policy image is required" });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "policies",
      allowed_formats: ["jpg", "jpeg", "png"],
    });

    const policy = await PolicyProduct.create({
      code,
      title,
      description,
      premium,
      termMonths,
      minSumInsured,
      imageUrl: uploadResult.secure_url,
    });

    await AuditLog.create({
      action: "CREATE_POLICY",
      actorId: req.user._id,
      details: { policyId: policy._id },
    });

    res.status(201).json(policy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const listPolicies = async (req, res) => {
  try {
    const policies = await PolicyProduct.find();
    res.json(policies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch policies" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    const agent = await User.create({ name, email, passwordHash, role: "agent" });

    await AuditLog.create({ action: "CREATE_AGENT", actorId: req.user._id, details: { agentId: agent._id } });
    res.status(201).json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create agent" });
  }
};

export const listClaims = async (req, res) => {
  try {
    const claims = await Claim.find().populate('userId', 'name email');
    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const claim = await Claim.findByIdAndUpdate(
      id, 
      { status, decisionNotes: notes, decidedByAgentId: req.user._id }, 
      { new: true }
    );
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    await AuditLog.create({ action: "UPDATE_CLAIM", actorId: req.user._id, details: { claimId: claim._id, status } });
    res.json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update claim" });
  }
};


export const listAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('actorId', 'name email').sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};


export const summary = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const agents = await User.countDocuments({ role: "agent" });
    const claimsPending = await Claim.countDocuments({ status: "PENDING" });
    const claimsApproved = await Claim.countDocuments({ status: "APPROVED" });
    const claimsRejected = await Claim.countDocuments({ status: "REJECTED" });
    const policies = await PolicyProduct.countDocuments();
    
    res.json({ 
      users, 
      agents, 
      claimsPending, 
      claimsApproved, 
      claimsRejected, 
      policies 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};
