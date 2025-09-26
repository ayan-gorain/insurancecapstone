import User from "../models/User.js";
import PolicyProduct from "../models/PolicyProduct.js";
import Claim from "../models/Claim.js";
import AuditLog from "../models/Auditlog.js";
import UserPolicy from "../models/UserPolicy.js";
import cloudinary from "../config/cloudinary.js";

export const getAvailablePolicies = async (req, res) => {
    try {
        console.log('getAvailablePolicies called by user:', req.user?.email, req.user?.role);
        
        // Get user with assigned agent information
        const user = await User.findById(req.user._id)
            .populate('assignedAgentId', 'name email');
        
        const policies = await PolicyProduct.find();
        console.log('Found policies in database:', policies.length);
        
        // Add assigned agent info to each policy
        const policiesWithAgent = policies.map(policy => ({
            ...policy.toObject(),
            assignedAgent: user.assignedAgentId ? {
                _id: user.assignedAgentId._id,
                name: user.assignedAgentId.name,
                email: user.assignedAgentId.email
            } : null
        }));
        
        res.json(policiesWithAgent);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch policies" });
    }
};



export const buyPolicy = async (req, res) => {
    try {
      const { policyId } = req.params;
      const { startDate, termMonths, nominee } = req.body;
  
      console.log('Buy Policy Request:', { policyId, startDate, termMonths, nominee, userId: req.user._id });
  
      // Validate required fields
      if (!startDate || !termMonths || !nominee) {
        console.log('Validation failed - missing required fields:', { startDate, termMonths, nominee });
        return res.status(400).json({ message: "startDate, termMonths, and nominee are required" });
      }
  
      // Validate termMonths is a positive number
      if (termMonths <= 0) {
        console.log('Validation failed - invalid termMonths:', termMonths);
        return res.status(400).json({ message: "termMonths must be a positive number" });
      }
  
      // Validate startDate is a valid date
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        console.log('Validation failed - invalid startDate:', startDate);
        return res.status(400).json({ message: "startDate must be a valid date" });
      }
  
      // find the policy product
      const policy = await PolicyProduct.findById(policyId);
      if (!policy) {
        console.log('Policy not found:', policyId);
        return res.status(404).json({ message: "Policy not found" });
      }
  
      console.log('Found policy:', policy.title, 'Premium:', policy.premium);
  
      // Check if user already has this policy active or pending
      const existingUserPolicy = await UserPolicy.findOne({
        userId: req.user._id,
        policyProductId: policyId,
        status: { $in: ["ACTIVE", "PENDING"] }
      });
      
      if (existingUserPolicy) {
        console.log('User already has active policy:', existingUserPolicy._id);
        return res.status(400).json({ message: "You already have an active policy of this type" });
      }
  
      // Calculate end date properly
      const endDate = new Date(startDateObj);
      endDate.setMonth(endDate.getMonth() + parseInt(termMonths));
  
      console.log('Creating user policy with dates:', { startDate: startDateObj, endDate });
  
      // create user policy
      const userPolicy = await UserPolicy.create({
        userId: req.user._id,
        policyProductId: policyId,
        startDate: startDateObj,
        endDate: endDate,
        premiumPaid: policy.premium,
        status: "ACTIVE",
        nominee,
      });

      console.log('User policy created successfully:', userPolicy._id);

      // log action
      await AuditLog.create({
        action: "BUY_POLICY",
        actorId: req.user._id,
        details: { 
          userPolicyId: userPolicy._id, 
          policyId,
          amount: policy.premium
        },
      });

      console.log('Audit log created successfully');

      res.status(201).json({
        message: "Policy purchased successfully",
        userPolicy: userPolicy
      });
    } catch (error) {
      console.error('Buy Policy Error:', error);
      res.status(500).json({ message: "Failed to buy policy", error: error.message });
    }
  };

export const getMyPolicies = async (req, res) => {
    try {
        const policies = await UserPolicy.find({userId: req.user._id})
            .populate('policyProductId')
            .populate({
                path: 'userId',
                select: 'assignedAgentId',
                populate: {
                    path: 'assignedAgentId',
                    select: 'name email'
                }
            });
        res.json(policies);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch policies" });
    }
};


export const cancelPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and update the user policy
        const userPolicy = await UserPolicy.findOneAndUpdate(
            { _id: id, userId: req.user._id, status: "ACTIVE" },
            { status: "CANCELLED" },
            { new: true }
        );
        
        if (!userPolicy) {
            return res.status(404).json({ message: "Active policy not found" });
        }
        
        await AuditLog.create({
            action: "CANCEL_POLICY",
            actorId: req.user._id,
            details: { userPolicyId: id }
        });

        res.json({ message: "Policy cancelled successfully", userPolicy });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to cancel policy" });
    }
};

export const submitClaim = async (req, res) => {
    try {
      const { userPolicyId, incidentDate, incidentLocation, description, amount, images } = req.body;
  
      // Validate required fields
      if (!userPolicyId || !incidentDate || !incidentLocation || !description || !amount) {
        return res.status(400).json({ message: "userPolicyId, incidentDate, incidentLocation, description, and amount are required" });
      }
  
      // Validate amount is positive
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
  
      // Validate images are provided (at least 2 for verification)
      if (!images || !Array.isArray(images) || images.length < 2) {
        return res.status(400).json({ message: "At least 2 verification images are required" });
      }
  
      const policy = await UserPolicy.findOne({ _id: userPolicyId, userId: req.user._id, status: "ACTIVE" });
      if (!policy) {
        return res.status(404).json({ message: "Active policy not found" });
      }
  
      // Check if incident date is within policy period
      const incidentDateObj = new Date(incidentDate);
      if (incidentDateObj < policy.startDate || incidentDateObj > policy.endDate) {
        return res.status(400).json({ message: "Incident date must be within policy period" });
      }
  
      // Process images - simple approach
      const processedImages = [];
      for (const image of images) {
        // If it's a URL, use it directly
        if (image.startsWith('http://') || image.startsWith('https://')) {
          processedImages.push(image);
        }
        // If it's base64, try to upload to Cloudinary
        else if (image.startsWith('data:')) {
          try {
            if (process.env.CLOUDINARY_CLOUD_NAME) {
              const uploadResult = await cloudinary.uploader.upload(image, {
                folder: "claim-proofs",
                allowed_formats: ["jpg", "jpeg", "png", "pdf"],
                resource_type: "auto"
              });
              processedImages.push(uploadResult.secure_url);
            } else {
              processedImages.push(image); // Store base64 if no Cloudinary
            }
          } catch (error) {
            console.error("Image upload error:", error);
            processedImages.push(image); // Fallback to original
          }
        }
        // Treat anything else as URL
        else {
          processedImages.push(image);
        }
      }
  
      const claim = await Claim.create({
        userId: req.user._id,
        userPolicyId,
        incidentDate: incidentDateObj,
        incidentLocation,
        description,
        amountClaimed: parseFloat(amount),
        proofImage: processedImages,
        status: "PENDING", // Goes to admin for approval
      });
  
      await AuditLog.create({
        action: "SUBMIT_CLAIM",
        actorId: req.user._id,
        details: { 
          claimId: claim._id, 
          userPolicyId,
          amountClaimed: amount,
          imagesCount: processedImages.length
        },
      });
  
      res.status(201).json({
        message: "Claim submitted successfully and sent for admin approval",
        claim: claim
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit claim" });
    }
  };

  export const getMyClaims = async (req, res) => {
    try {
      const claims = await Claim.find({ userId: req.user._id })
        .populate("userPolicyId", "startDate endDate premiumPaid status")
        .populate("userPolicyId.policyProductId", "title description premium termMonths minSumInsured")
        .populate("decidedByAgentId", "name email")
        .sort({ createdAt: -1 });
      res.json(claims);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  };

  // Get claim details
  export const getClaimDetails = async (req, res) => {
    try {
      const { claimId } = req.params;
      const userId = req.user._id;
      
      const claim = await Claim.findOne({
        _id: claimId,
        userId: userId
      })
        .populate("userPolicyId", "startDate endDate premiumPaid status")
        .populate("userPolicyId.policyProductId", "title description premium termMonths minSumInsured")
        .populate("decidedByAgentId", "name email");
      
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      res.json({
        claim
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch claim details" });
    }
  };

  // Get claim statistics for customer
  export const getClaimStats = async (req, res) => {
    try {
      const userId = req.user._id;
      
      const stats = await Claim.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amountClaimed" }
          }
        }
      ]);
      
      const totalClaims = await Claim.countDocuments({ userId: userId });
      const pendingClaims = await Claim.countDocuments({ userId: userId, status: "PENDING" });
      const approvedClaims = await Claim.countDocuments({ userId: userId, status: "APPROVED" });
      const rejectedClaims = await Claim.countDocuments({ userId: userId, status: "REJECTED" });
      
      res.json({
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        statusBreakdown: stats
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch claim statistics" });
    }
  };


