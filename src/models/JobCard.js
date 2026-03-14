import mongoose from "mongoose";

const JobDetailSchema = new mongoose.Schema(
  {
    jobName: String,
    qty: Number,
    itemCode: String,
    finishingSize: String,
    imageUrl: String,
  },
  { _id: false }
);

const SamplesSchema = new mongoose.Schema(
  {
    poplSample: String,
    clientSample: String,
    digitalPtg: String,
    ferrow: String,
    pdf: String,
    oldSheet: String,
  },
  { _id: false }
);

const PaperCuttingSchema = new mongoose.Schema(
  {
    paperSize: String,
    gsm: String,
    paperType: String,
    paperMill: String,
    cuttingSize: String,
    actualSheet: Number,
    wastageSheet: Number,
    forWhat: String,
    jobName: String,
  },
  { _id: false }
);

const PrintingMachineSchema = new mongoose.Schema(
  {
    machineName: String,
    noOfPlate: Number,
    noOfForms: Number,
    printing: String,
    plateType: String,
    forWhat: String,
    totalSheets: Number,
    printingSide: String,
    impressions: Number,
  },
  { _id: false }
);

const JobOperationColumnSchema = new mongoose.Schema(
  {
    qty: Number,
    machine: String,
  },
  { _id: false }
);

const JobOperationRowSchema = new mongoose.Schema(
  {
    row: Number,
    columns: [JobOperationColumnSchema],
  },
  { _id: false }
);

const DieInfoSchema = new mongoose.Schema(
  {
    howManyDie: String,
    typeOfDie: String,
    nameOfDie: String,
    dieNo: String,
  },
  { _id: false }
);

const PackingSchema = new mongoose.Schema(
  {
    cartonBy: String,
    labelBy: String,
    dispatchBy: String,
    shrink: String,
    typeOfPacking: String,
    requiredCtnPatti: String,
    packingRemark: String,
  },
  { _id: false }
);

const RequiredItemSchema = new mongoose.Schema(
  {
    itemName: String,
    size: String,
    qty: Number,
    name: String,
    remark: String,
  },
  { _id: false }
);

const RequiredPaperSchema = new mongoose.Schema(
  {
    paperBoardName: String,
    gradeBrand: String,
    sizeOfPaper: String,
    gsm: String,
    qty: Number,
    unit: String,
    remark: String,
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    bookedBy: String,
    companyName: String,
    approvedBy: String,
  },
  { _id: false }
);

const JobCardSchema = new mongoose.Schema(
  {
    jobCardNo: { type: String, required: true, unique: true },
    jobType: String,
    date: Date,
    poNo: String,
    oldJobNo: String,
    paperBy: String,
    deliveryDate: Date,
    clientName: String,
    category: String,
    bindingType: String,

    jobDetails: [JobDetailSchema],

    jobSpecification: String,

    samples: SamplesSchema,

    paperCutting: [PaperCuttingSchema],

    printingMachines: [PrintingMachineSchema],

    remark: String,

    jobOperationHeaders: [String],
    jobOperations: [JobOperationRowSchema],

    dieInfo: DieInfoSchema,

    packing: PackingSchema,

    requiredItems: [RequiredItemSchema],

    requiredPaper: [RequiredPaperSchema],

    paperRequiredRemark: String,

    booking: BookingSchema,

    fmsStatusByJob: [String],
    closeJobCard: Boolean,
    fmsRemarks: String,
    jobOwner: String,
    designer: String,

    pdfUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.JobCard ||
  mongoose.model("JobCard", JobCardSchema);

