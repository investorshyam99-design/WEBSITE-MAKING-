import { CheckCircle2, Truck, ShieldCheck, MessageCircle } from "lucide-react";

const features = [
  {
    name: "Premium Quality",
    icon: ShieldCheck,
  },
  {
    name: "Fast Delivery",
    icon: Truck,
  },
  {
    name: "Trusted Shop",
    icon: CheckCircle2,
  },
  {
    name: "Direct Support",
    icon: MessageCircle,
  }
];

export function TrustSection() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EDE3D8] pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-[#EDE3D8] rounded-full flex items-center justify-center mb-3">
                <feature.icon className="h-5 w-5 text-[#5A2E0F]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
