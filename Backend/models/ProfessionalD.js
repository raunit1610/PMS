import mongoose from "mongoose";

const PersonalDSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: "Account"
    },
    designation:{
        type: String,
        default: "",
    },
    businessUnit:{
        type: String,
        default: "",
    },
    department:{
        type: String,
        default: "",
    },
    workStation:{
        type: String,
        default: "",
    },
    reportingTo:{
        type: String,
        default: "",
    },
    employeeId:{
        type: String,
        default: "",
    },
    emailProfessional:{
        type: String,
        default: "",
    },
    dateOfJoining:{
        type: String,
        default: "",
    },
    degree:{
        type: String,
        default: "",
    },
    institution:{
        type: String,
        default: "",
    },
    year:{
        type: String,
        default: "",
    },
    percentage:{
        type: String,
        default: "",
    },
    paddress1:{
        type: String,
        default: "",
    },
    paddress2:{
        type: String,
        default: "",
    },
    pcity:{
        type: String,
        default: "",
    },
    pstate:{
        type: String,
        default: "",
    },
    pzipCode:{
        type: String,
        default: "",
    },
    pcountry:{
        type: String,
        default: "",
    },
});

const ProfessionalD = mongoose.model("Professional_Detail", PersonalDSchema);

export default ProfessionalD;