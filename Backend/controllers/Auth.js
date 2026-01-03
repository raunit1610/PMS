import account from "../models/Auth.js";
import ProfessionalD from "../models/ProfessionalD.js";

async function handleLoginPost(req, res) {
  try {
    const data = req.body;
    
    const user = await account.findOne({
      email: data.email,
      password: data.password,
    });
    const userId = user ? user._id : null;
    if (user) {
      res.status(200).json({
        message: "Logged In Successfully",
        uid: userId,
        name: user.name,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleCreatePost(req, res) {
  try {
    const createData = req.body;
    const createUser = await account.create(createData);
    // Also create a ProfessionalD entry linked to this user
    const createProfession = await ProfessionalD.create({
      // Optionally add user id to allow linkage if needed in the future
      userId: createUser._id
    });
    if (createUser && createProfession) {
      res.status(200).json({
        message: "User Created Successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleForgotPassword(req, res) {
  try {
    const message = req.body;
    const users = await account.find({});
    const user = users.find(
      (user) => user.email === message.data || user.username === message.data
    );
    if (user) {
      res.status(200).json({
        message: "User Found",
        password: user.password,
      });
    } else {
      res.status(404).json({
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleProfileGet(req, res){
  try {
    const userId = req.params.Id;
    const personalD = await account.findById(userId);
    const professionalDt = await ProfessionalD.findOne({ userId });
    // Merge personalD and professionalDt into a single object omitting duplicates
    if (!personalD) {
      return res.status(404).json({ message: "Personal details not found" });
    }
    if (!professionalDt) {
      return res.status(404).json({ message: "Professional details not found" });
    }
    // Convert Mongoose documents to plain objects
    const personalObj = personalD.toObject();
    const professionalObj = professionalDt.toObject();
    // Avoid duplicate _id and userId fields; exclude __v as well
    delete professionalObj._id;
    delete professionalObj.userId;
    delete personalObj.__v;
    delete professionalObj.__v;
    // Merge, with professionalObj values overwriting personalObj if there is overlap
    const mergedProfile = { ...personalObj, ...professionalObj };
    res.status(200).json({ profile: mergedProfile });
  } catch (error){
    res.status(500).json({
      message: error.message,
    });
  }
}

async function handleProfilePost(req, res){
  try{
    const data = req.body;
    // Find a single user with all matching personal details
    // Update the user's personal details in the "account" collection
    const updateData = {
        name: data.name,
        password: data.password,
        email: data.emailPersonal,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        bloodGroup: data.bloodGroup,
        physicallyChallenged: data.physicallyChallenged,
        phone: data.phone,
        phoneSecondary: data.phoneSecondary,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country
    };
    
    // Add profile photo if provided
    if (data.profilePhoto) {
        updateData.profilePhoto = data.profilePhoto;
    }
    
    const user_personal = await account.findByIdAndUpdate(
      data.Id,
      updateData,
      { new: true }
    );

    const user_professional = await ProfessionalD.findOneAndUpdate(
      { userId: data.Id },
      {
        designation: data.designation,
        businessUnit: data.businessUnit,
        department: data.department,
        workStation: data.workStation,
        reportingTo: data.reportingTo,
        employeeId: data.employeeId,
        emailProfessional: data.emailProfessional,
        dateOfJoining: data.dateOfJoining,
        degree: data.degree,
        institution: data.institution,
        year: data.year,
        percentage: data.percentage,
        paddress1: data.paddress1,
        paddress2: data.paddress2,
        pcity: data.pcity,
        pstate: data.pstate,
        pzipCode: data.pzipCode,
        pcountry: data.pcountry
      },
      { new: true }
    );

      res.status(200).json({
        message: "User Details Updated Successfully",
      });
    
  } catch(error){
    res.status(500).json({
      message: error.message,
    });
  }
}

export { handleLoginPost, handleCreatePost, handleForgotPassword, handleProfileGet, handleProfilePost };