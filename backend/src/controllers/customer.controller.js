import User from "../models/User.js";
import PolicyProduct from "../models/PolicyProduct.js";
import Claim from "../models/Claim.js";
import AuditLog from "../models/Auditlog.js";
import UserPolicy from "../models/UserPolicy.js";
import Payment from "../models/Payment.js";
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
      const { startDate, termMonths, nominee, paymentMethod, paymentReference, cardNumber, upiId } = req.body;
  
      console.log('Buy Policy Request:', { policyId, startDate, termMonths, nominee, paymentMethod, paymentReference, userId: req.user._id });
  
      // Validate required fields
      if (!startDate || !termMonths || !nominee || !paymentMethod || !paymentReference) {
        console.log('Validation failed - missing required fields:', { startDate, termMonths, nominee, paymentMethod, paymentReference });
        return res.status(400).json({ message: "startDate, termMonths, nominee, paymentMethod, and paymentReference are required" });
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

      // Validate payment method
      const validMethods = ["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PAYPAL", "CASH"];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({ 
          message: "Invalid payment method. Must be one of: " + validMethods.join(", ") 
        });
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

      // Check if payment reference already exists
      const existingPayment = await Payment.findOne({ reference: paymentReference });
      if (existingPayment) {
        return res.status(400).json({ 
          message: "Payment reference already exists" 
        });
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

      // Create payment record
      const payment = await Payment.create({
        userId: req.user._id,
        policyId: policyId,
        userPolicyId: userPolicy._id,
        amount: policy.premium,
        method: paymentMethod,
        reference: paymentReference,
        cardNumber: cardNumber || null,
        upiId: upiId || null,
        status: "COMPLETED" // Simulated payment - always successful
      });

      console.log('Payment recorded successfully:', payment._id);

      // log action
      await AuditLog.create({
        action: "BUY_POLICY",
        actorId: req.user._id,
        details: { 
          userPolicyId: userPolicy._id, 
          policyId,
          amount: policy.premium,
          paymentId: payment._id,
          paymentMethod: paymentMethod,
          paymentReference: paymentReference
        },
      });

      console.log('Audit log created successfully');

      res.status(201).json({
        message: "Policy purchased and payment recorded successfully",
        userPolicy: userPolicy,
        payment: payment
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
  
      // Check if user has an assigned agent
      const user = await User.findById(req.user._id);
      if (!user.assignedAgentId) {
        return res.status(403).json({ 
          message: "You cannot submit claims until an agent is assigned to you. Please contact support to get an agent assigned." 
        });
      }
  
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
      console.log('Customer Controller - Getting claims for user:', req.user._id);
      
      const claims = await Claim.find({ userId: req.user._id })
        .populate("userPolicyId", "startDate endDate premiumPaid status")
        .populate("userPolicyId.policyProductId", "title description premium termMonths minSumInsured")
        .populate("decidedByAgentId", "name email")
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance
      
      console.log('Customer Controller - Found claims:', claims.length);
      res.json(claims);
    } catch (err) {
      console.error('Customer Controller - Error fetching claims:', err);
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
      console.log('Customer Controller - Getting claim stats for user:', userId);
      
      // Use a single aggregation query for better performance
      const stats = await Claim.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalClaims: { $sum: 1 },
            pendingClaims: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
            },
            approvedClaims: {
              $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] }
            },
            rejectedClaims: {
              $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] }
            },
            totalClaimedAmount: { $sum: "$amountClaimed" },
            totalApprovedAmount: {
              $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, "$approvedAmount", 0] }
            }
          }
        }
      ]);
      
      const result = stats[0] || {
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        totalClaimedAmount: 0,
        totalApprovedAmount: 0
      };
      
      console.log('Customer Controller - Claim stats result:', result);
      res.json(result);
    } catch (err) {
      console.error('Customer Controller - Error fetching claim stats:', err);
      res.status(500).json({ message: "Failed to fetch claim statistics" });
    }
  };

  // Submit claim without requiring active policy (for users without policies)
  export const submitClaimWithoutPolicy = async (req, res) => {
    try {
      const { incidentDate, incidentLocation, description, amount, images, policyType } = req.body;
  
      // Check if user has an assigned agent
      const user = await User.findById(req.user._id);
      if (!user.assignedAgentId) {
        return res.status(403).json({ 
          message: "You cannot submit claims until an agent is assigned to you. Please contact support to get an agent assigned." 
        });
      }
  
      // Validate required fields (userPolicyId is optional now)
      if (!incidentDate || !incidentLocation || !description || !amount) {
        return res.status(400).json({ message: "incidentDate, incidentLocation, description, and amount are required" });
      }
  
      // Validate amount is positive
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
  
      // Validate images are provided (at least 2 for verification)
      if (!images || !Array.isArray(images) || images.length < 2) {
        return res.status(400).json({ message: "At least 2 verification images are required" });
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
        userPolicyId: null, // No policy required
        incidentDate: new Date(incidentDate),
        incidentLocation,
        description,
        amountClaimed: parseFloat(amount),
        proofImage: processedImages,
        status: "PENDING", // Goes to admin for approval
        policyType: policyType || "GENERAL", // Track what type of policy this claim is for
        isWithoutPolicy: true // Flag to indicate this claim was submitted without an active policy
      });
  
      await AuditLog.create({
        action: "SUBMIT_CLAIM_WITHOUT_POLICY",
        actorId: req.user._id,
        details: { 
          claimId: claim._id, 
          amountClaimed: amount,
          imagesCount: processedImages.length,
          policyType: policyType || "GENERAL"
        },
      });
  
      res.status(201).json({
        message: "Claim submitted successfully and sent for admin approval. Note: This claim was submitted without an active policy.",
        claim: claim
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit claim" });
    }
  };

  // Record payment for a policy
  export const recordPayment = async (req, res) => {
    try {
      const { policyId, amount, method, reference, cardNumber, upiId } = req.body;
      const userId = req.user._id;

      console.log('Record Payment Request:', { policyId, amount, method, reference, userId });

      // Validate required fields
      if (!policyId || !amount || !method || !reference) {
        return res.status(400).json({ 
          message: "policyId, amount, method, and reference are required" 
        });
      }

      // Validate amount is positive
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      // Validate payment method
      const validMethods = ["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PAYPAL", "CASH"];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ 
          message: "Invalid payment method. Must be one of: " + validMethods.join(", ") 
        });
      }

      // Check if policy exists
      const policy = await PolicyProduct.findById(policyId);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      // Check if user has an active user policy for this policy product
      const userPolicy = await UserPolicy.findOne({
        userId: userId,
        policyProductId: policyId,
        status: "ACTIVE"
      });

      if (!userPolicy) {
        return res.status(404).json({ 
          message: "No active policy found for this user and policy product" 
        });
      }

      // Check if payment reference already exists
      const existingPayment = await Payment.findOne({ reference });
      if (existingPayment) {
        return res.status(400).json({ 
          message: "Payment reference already exists" 
        });
      }

      // Create payment record
      const payment = await Payment.create({
        userId,
        policyId,
        userPolicyId: userPolicy._id,
        amount: parseFloat(amount),
        method,
        reference,
        cardNumber: cardNumber || null,
        upiId: upiId || null,
        status: "COMPLETED" // Simulated payment - always successful
      });

      // Log payment action
      await AuditLog.create({
        action: "RECORD_PAYMENT",
        actorId: userId,
        details: { 
          paymentId: payment._id,
          policyId,
          userPolicyId: userPolicy._id,
          amount: amount,
          method: method,
          reference: reference
        },
      });

      console.log('Payment recorded successfully:', payment._id);

      res.status(201).json({
        message: "Payment recorded successfully",
        payment: payment
      });

    } catch (error) {
      console.error('Record Payment Error:', error);
      res.status(500).json({ 
        message: "Failed to record payment", 
        error: error.message 
      });
    }
  };

  // Get payments for current user
  export const getUserPayments = async (req, res) => {
    try {
      const userId = req.user._id;

      const payments = await Payment.find({ userId })
        .populate('policyId', 'title description premium')
        .populate('userPolicyId', 'startDate endDate status')
        .select('amount method reference cardNumber upiId status paymentDate createdAt')
        .sort({ createdAt: -1 });

      res.json(payments);

    } catch (error) {
      console.error('Get User Payments Error:', error);
      res.status(500).json({ 
        message: "Failed to fetch payments", 
        error: error.message 
      });
    }
  };

  // Check if user has an assigned agent
  export const checkAgentAssignment = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('assignedAgentId', 'name email');

      res.json({
        hasAssignedAgent: !!user.assignedAgentId,
        assignedAgent: user.assignedAgentId ? {
          _id: user.assignedAgentId._id,
          name: user.assignedAgentId.name,
          email: user.assignedAgentId.email
        } : null
      });

    } catch (error) {
      console.error('Check Agent Assignment Error:', error);
      res.status(500).json({ 
        message: "Failed to check agent assignment", 
        error: error.message 
      });
    }
  };


