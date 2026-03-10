import mongoose from "mongoose";

const DropdownsSchema = new mongoose.Schema(
  {
    clientNames: [String],
    categories: [String],
    bindingTypes: [String],
    paperTypes: [String],
    paperMills: [String],
    forWhatOptions: [String],
    printingMachines: [String],
    operationMachines: [String],
    jobOperations: [String],
    itemNames: [String],
    paperBoardNames: [String],
    gradeBrands: [String],
    jobNames: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Dropdowns ||
  mongoose.model("Dropdowns", DropdownsSchema);

