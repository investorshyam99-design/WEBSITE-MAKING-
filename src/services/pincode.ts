export interface PincodeDetails {
  isServiceable: boolean;
  city?: string;
  district?: string;
  state?: string;
  message?: string;
  prepaid?: boolean;
  cod?: boolean;
  tat?: {
    normal: { days: number; mode: string };
    express: { days: number; mode: string; available: boolean };
  };
}

export async function checkPincodeServiceability(pincode: string): Promise<PincodeDetails> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return {
      isServiceable: false,
      message: "Please enter a valid Indian pincode.",
    };
  }

  try {
    const response = await fetch(`/api/delhivery?action=serviceability&pincode=${pincode}`);
    const data = await response.json();
    
    if (!response.ok) {
       return {
         isServiceable: false,
         message: data.error || `HTTP ${response.status}: Delivery estimate temporarily unavailable.`,
       };
    }

    if (data && data.success && data.isServiceable) {
      // Also fetch TAT
      const tatResponse = await fetch(`/api/delhivery?action=tat&dest=${pincode}`);
      let tat = null;
      if (tatResponse.ok) {
        const tatData = await tatResponse.json();
        if (tatData.success) {
           tat = tatData.tat;
        }
      }
      return {
        isServiceable: true,
        city: data.city,
        district: data.district,
        state: data.state,
        prepaid: data.prepaid,
        cod: data.cod,
        tat: tat,
        message: "Delivery is available",
      };
    } else {
      return {
        isServiceable: false,
        message: data.error || "Pincode valid but not serviceable.",
      };
    }
  } catch (error: any) {
    console.error("Error fetching pincode details from Delhivery:", error);
    return {
      isServiceable: false,
      message: `Network/Fetch error: ${error.message}`,
    };
  }
}
