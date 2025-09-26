import PolicyProduct from "../models/PolicyProduct.js";
import User from "../models/User.js";
import Claim from "../models/Claim.js";
import cloudinary from "../config/cloudinary.js";
import AuditLog from "../models/Auditlog.js";
import bcrypt from 'bcrypt';
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

export const updatePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { code, title, description, premium, termMonths, minSumInsured, image } = req.body;

    let updateData = { code, title, description, premium, termMonths, minSumInsured };

    // If image is provided, upload it to Cloudinary
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "policies",
        allowed_formats: ["jpg", "jpeg", "png"],
      });
      updateData.imageUrl = uploadResult.secure_url;
    }

    const policy = await PolicyProduct.findByIdAndUpdate(
      policyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await AuditLog.create({
      action: "UPDATE_POLICY",
      actorId: req.user._id,
      details: { policyId: policy._id },
    });

    res.json(policy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await PolicyProduct.findByIdAndDelete(policyId);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await AuditLog.create({
      action: "DELETE_POLICY",
      actorId: req.user._id,
      details: { policyId: policy._id },
    });

    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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
    const { name, email, password, address, photo } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const agent = await User.create({ 
      name, 
      email, 
      passwordHash, 
      role: "agent",
      address: address || "",
      photo: photo || ""
    });

    await AuditLog.create({ action: "CREATE_AGENT", actorId: req.user._id, details: { agentId: agent._id } });
    
    // Return agent without password hash
    const agentResponse = { ...agent.toObject() };
    delete agentResponse.passwordHash;
    
    res.status(201).json(agentResponse);
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
    const { status, notes, approvedAmount } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    // Get the claim first to validate
    const existingClaim = await Claim.findById(id).populate('userId', 'name email');
    if (!existingClaim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    
    // Validate claim eligibility
    if (status === 'APPROVED') {
      // Check if policy is still active
      const userPolicy = await UserPolicy.findById(existingClaim.userPolicyId);
      if (!userPolicy || userPolicy.status !== 'ACTIVE') {
        return res.status(400).json({ message: "Cannot approve claim for inactive policy" });
      }
      
      // Check if incident date is within policy period
      if (existingClaim.incidentDate < userPolicy.startDate || existingClaim.incidentDate > userPolicy.endDate) {
        return res.status(400).json({ message: "Incident date is outside policy period" });
      }
      
      // Validate approved amount
      if (approvedAmount && approvedAmount > existingClaim.amountClaimed) {
        return res.status(400).json({ message: "Approved amount cannot exceed claimed amount" });
      }
    }
    
    const updateData = {
      status,
      decisionNotes: notes,
      decidedByAgentId: req.user._id,
      decidedAt: new Date()
    };
    
    // Add approved amount if provided
    if (approvedAmount) {
      updateData.approvedAmount = approvedAmount;
    }
    
    const claim = await Claim.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'startDate endDate premiumPaid')
      .populate('userPolicyId.policyProductId', 'title description');
    

    // Log the action with more details
    await AuditLog.create({ 
      action: "UPDATE_CLAIM", 
      actorId: req.user._id, 
      details: { 
        claimId: claim._id, 
        status,
        customerName: existingClaim.userId.name,
        customerEmail: existingClaim.userId.email,
        claimedAmount: existingClaim.amountClaimed,
        approvedAmount: approvedAmount || null,
        notes: notes || null
      } 
    });
    
    res.json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: claim
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update claim" });
  }
};

// Get claims assigned to specific agent
export const getAgentClaims = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get customers assigned to this agent
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: agentId 
    }).select('_id');
    
    const customerIds = customers.map(c => c._id);
    
    const claims = await Claim.find({ userId: { $in: customerIds } })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'startDate endDate premiumPaid')
      .populate('userPolicyId.policyProductId', 'title description')
      .populate('decidedByAgentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch agent claims" });
  }
};

// Get claim analytics for agents
export const getClaimAnalytics = async (req, res) => {
  try {
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'PENDING' });
    const approvedClaims = await Claim.countDocuments({ status: 'APPROVED' });
    const rejectedClaims = await Claim.countDocuments({ status: 'REJECTED' });
    
    const totalClaimedAmount = await Claim.aggregate([
      { $group: { _id: null, total: { $sum: "$amountClaimed" } } }
    ]);
    
    const totalApprovedAmount = await Claim.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
    ]);
    
    const claimsByMonth = await Claim.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amountClaimed" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalClaimedAmount: totalClaimedAmount[0]?.total || 0,
      totalApprovedAmount: totalApprovedAmount[0]?.total || 0,
      claimsByMonth
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claim analytics" });
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


export const assignAgentToCustomer = async (req, res) => {
  try {
    const { customerId, agentId } = req.body;
    
    // Validate that customer exists and is a customer
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      return res.status(400).json({ message: "Invalid customer" });
    }
    
    // Validate that agent exists and is an agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ message: "Invalid agent" });
    }
    
    // Update customer with assigned agent
    const updatedCustomer = await User.findByIdAndUpdate(
      customerId,
      { assignedAgentId: agentId },
      { new: true }
    ).populate('assignedAgentId', 'name email');
    
    console.log('Updated customer:', updatedCustomer);
    
    await AuditLog.create({
      action: "ASSIGN_AGENT",
      actorId: req.user._id,
      details: { customerId, agentId }
    });
    
    res.json(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign agent" });
  }
};

export const getAgentCustomers = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Validate that agent exists
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ message: "Invalid agent" });
    }
    
    // Get all customers assigned to this agent
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: agentId 
    }).select('-passwordHash');
    
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch agent customers" });
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
