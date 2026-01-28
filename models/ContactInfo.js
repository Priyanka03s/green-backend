import mongoose from "mongoose";

const contactInfoSchema = new mongoose.Schema(
  {
    officeAddress: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    businessHours: {
      type: String
    },
    whatsappNumber: {
      type: String
    },
    mapEmbedUrl: {
      type: String
    }
  },
  { timestamps: true }
);

const ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

export default ContactInfo;
