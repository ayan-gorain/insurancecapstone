import User from "../models/User.js";
import PolicyProduct from "../models/PolicyProduct.js";
import Claim from "../models/Claim.js";
import UserPolicy from "../models/UserPolicy.js";
import AuditLog from "../models/Auditlog.js";

// Get agent's assigned customers
export const getMyCustomers = async (req, res) => {
  try {
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: req.user._id 
    }).select('-passwordHash').populate('assignedAgentId', 'name email');
    
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// Get claims for agent's assigned customers
export const getMyCustomersClaims = async (req, res) => {
  try {
    // Get customers assigned to this agent
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: req.user._id 
    }).select('_id');
    
    const customerIds = customers.map(c => c._id);
    
    const claims = await Claim.find({ userId: { $in: customerIds } })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'startDate endDate premiumPaid status')
      .populate('userPolicyId.policyProductId', 'title description premium termMonths minSumInsured')
      .populate('decidedByAgentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
};

// Get pending claims for agent's customers
export const getPendingClaims = async (req, res) => {
  try {
    console.log('Agent Controller - Get Pending Claims - User ID:', req.user._id);
    console.log('Agent Controller - Get Pending Claims - User Role:', req.user.role);
    
    // Get customers assigned to this agent
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: req.user._id 
    }).select('_id');
    
    console.log('Agent Controller - Get Pending Claims - Assigned customers:', customers.length);
    console.log('Agent Controller - Get Pending Claims - Customer IDs:', customers.map(c => c._id));
    
    const customerIds = customers.map(c => c._id);
    
    const pendingClaims = await Claim.find({ 
      userId: { $in: customerIds },
      status: 'PENDING'
    })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'startDate endDate premiumPaid status')
      .populate('userPolicyId.policyProductId', 'title description premium termMonths minSumInsured')
      .sort({ createdAt: -1 });
    
    console.log('Agent Controller - Get Pending Claims - Found pending claims:', pendingClaims.length);
    console.log('Agent Controller - Get Pending Claims - Claims:', pendingClaims.map(c => ({ id: c._id, status: c.status, customer: c.userId?.name })));
    
    res.json(pendingClaims);
  } catch (err) {
    console.error('Agent Controller - Get Pending Claims - Error:', err);
    res.status(500).json({ message: "Failed to fetch pending claims" });
  }
};

// Review and approve/reject a claim
export const reviewClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, notes, approvedAmount } = req.body;
    
    console.log('Agent Controller - Review Claim - Claim ID:', claimId);
    console.log('Agent Controller - Review Claim - Request Body:', req.body);
    console.log('Agent Controller - Review Claim - User ID:', req.user._id);
    console.log('Agent Controller - Review Claim - User Role:', req.user.role);
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      console.log('Agent Controller - Review Claim - Invalid status:', status);
      return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
    }
    
    // Get the claim and verify it belongs to agent's customer
    console.log('Agent Controller - Review Claim - Looking for claim with ID:', claimId);
    const claim = await Claim.findById(claimId).populate('userId', 'name email assignedAgentId');
    console.log('Agent Controller - Review Claim - Found claim:', claim ? 'Yes' : 'No');
    
    if (!claim) {
      console.log('Agent Controller - Review Claim - Claim not found');
      return res.status(404).json({ message: "Claim not found" });
    }
    
    console.log('Agent Controller - Review Claim - Claim user ID:', claim.userId._id);
    console.log('Agent Controller - Review Claim - Claim assigned agent ID:', claim.userId.assignedAgentId);
    console.log('Agent Controller - Review Claim - Current user ID:', req.user._id);
    
    // Verify the claim belongs to agent's assigned customer
    if (claim.userId.assignedAgentId.toString() !== req.user._id.toString()) {
      console.log('Agent Controller - Review Claim - Access denied - not assigned to this agent');
      return res.status(403).json({ message: "You can only review claims for your assigned customers" });
    }
    
    // Validate claim eligibility for approval
    if (status === 'APPROVED') {
      // Check if policy is still active
      const userPolicy = await UserPolicy.findById(claim.userPolicyId);
      if (!userPolicy || userPolicy.status !== 'ACTIVE') {
        return res.status(400).json({ message: "Cannot approve claim for inactive policy" });
      }
      
      // Check if incident date is within policy period
      if (claim.incidentDate < userPolicy.startDate || claim.incidentDate > userPolicy.endDate) {
        return res.status(400).json({ message: "Incident date is outside policy period" });
      }
      
      // Validate approved amount
      if (approvedAmount && approvedAmount > claim.amountClaimed) {
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
    
    const updatedClaim = await Claim.findByIdAndUpdate(claimId, updateData, { new: true })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'startDate endDate premiumPaid status')
      .populate('userPolicyId.policyProductId', 'title description')
      .populate('decidedByAgentId', 'name email');
    
    // Log the action
    await AuditLog.create({ 
      action: "AGENT_REVIEW_CLAIM", 
      actorId: req.user._id, 
      details: { 
        claimId: updatedClaim._id, 
        status,
        customerName: claim.userId.name,
        customerEmail: claim.userId.email,
        claimedAmount: claim.amountClaimed,
        approvedAmount: approvedAmount || null,
        notes: notes || null
      } 
    });
    
    console.log('Agent Controller - Review Claim - Success - Updated claim:', updatedClaim._id);
    res.json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: updatedClaim
    });
  } catch (err) {
    console.error('Agent Controller - Review Claim - Error:', err);
    res.status(500).json({ message: "Failed to review claim" });
  }
};

// Get claim details for review
export const getClaimDetails = async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const claim = await Claim.findById(claimId)
      .populate('userId', 'name email assignedAgentId')
      .populate('userPolicyId', 'startDate endDate premiumPaid status')
      .populate('userPolicyId.policyProductId', 'title description premium termMonths minSumInsured')
      .populate('decidedByAgentId', 'name email');
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    
    // Verify the claim belongs to agent's assigned customer
    if (claim.userId.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view claims for your assigned customers" });
    }
    
    res.json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claim details" });
  }
};

// Get agent's claim statistics
export const getMyClaimStats = async (req, res) => {
  try {
    // Get customers assigned to this agent
    const customers = await User.find({ 
      role: 'customer', 
      assignedAgentId: req.user._id 
    }).select('_id');
    
    const customerIds = customers.map(c => c._id);
    
    const totalClaims = await Claim.countDocuments({ userId: { $in: customerIds } });
    const pendingClaims = await Claim.countDocuments({ userId: { $in: customerIds }, status: 'PENDING' });
    const approvedClaims = await Claim.countDocuments({ userId: { $in: customerIds }, status: 'APPROVED' });
    const rejectedClaims = await Claim.countDocuments({ userId: { $in: customerIds }, status: 'REJECTED' });
    
    const totalClaimedAmount = await Claim.aggregate([
      { $match: { userId: { $in: customerIds } } },
      { $group: { _id: null, total: { $sum: "$amountClaimed" } } }
    ]);
    
    const totalApprovedAmount = await Claim.aggregate([
      { $match: { userId: { $in: customerIds }, status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
    ]);
    
    const claimsByMonth = await Claim.aggregate([
      { $match: { userId: { $in: customerIds } } },
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
      claimsByMonth,
      assignedCustomers: customers.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claim statistics" });
  }
};

// Get customer's policy details
export const getCustomerPolicies = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer is assigned to this agent
    const customer = await User.findOne({ 
      _id: customerId, 
      role: 'customer', 
      assignedAgentId: req.user._id 
    });
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found or not assigned to you" });
    }
    
    const policies = await UserPolicy.find({ userId: customerId })
      .populate('policyProductId', 'title description premium termMonths minSumInsured imageUrl')
      .sort({ createdAt: -1 });
    
    res.json({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email
      },
      policies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customer policies" });
  }
};

// Get customer's claim history
export const getCustomerClaims = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer is assigned to this agent
    const customer = await User.findOne({ 
      _id: customerId, 
      role: 'customer', 
      assignedAgentId: req.user._id 
    });
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found or not assigned to you" });
    }
    
    const claims = await Claim.find({ userId: customerId })
      .populate('userPolicyId', 'startDate endDate premiumPaid status')
      .populate('userPolicyId.policyProductId', 'title description')
      .populate('decidedByAgentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email
      },
      claims
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customer claims" });
  }
};

// Get agent's profile
export const getMyProfile = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('assignedAgentId', 'name email');
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    // Get assigned customers count
    const assignedCustomersCount = await User.countDocuments({ 
      role: 'customer', 
      assignedAgentId: req.user._id 
    });
    
    res.json({
      ...agent.toObject(),
      assignedCustomersCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update agent profile
export const updateMyProfile = async (req, res) => {
  try {
    const { name, address, photo } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (photo !== undefined) updateData.photo = photo;
    
    const updatedAgent = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    // Log the action
    await AuditLog.create({
      action: "AGENT_UPDATE_PROFILE",
      actorId: req.user._id,
      details: { updatedFields: Object.keys(updateData) }
    });
    
    res.json({
      message: "Profile updated successfully",
      agent: updatedAgent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
