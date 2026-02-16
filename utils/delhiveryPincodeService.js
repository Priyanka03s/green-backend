import axios from "axios";

export const checkDelhiveryPincode = async (pincode) => {
  const response = await axios.get(
    `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`,
    {
      headers: {
        Authorization: `Token ${process.env.DELIVERY_API_KEY}`,
      },
    }
  );

  const data = response.data.delivery_codes;

  // Non-serviceable
  if (!data || data.length === 0) {
    return { serviceable: false, message: "Non-serviceable pincode" };
  }

  const remark = data[0].postal_code.remark;

  // Embargo case
  if (remark === "Embargo") {
    return {
      serviceable: false,
      message: "Delivery temporarily unavailable (Embargo)",
    };
  }

  return { serviceable: true, message: "Delivery available" };
};
