import { X } from "lucide-react";

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PoliciesModal({ isOpen, onClose }: PoliciesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1E2A44] text-white p-4 flex items-center justify-between z-10">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">Our Policies</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 text-[#1B1B1B]">
          <section>
            <h3 className="text-lg font-bold uppercase tracking-wide border-b-2 border-[#F5EFE6] pb-2 mb-4">Delivery Policy</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>At Jersey Unicorn, we deliver orders through trusted courier partners such as <strong>Delhivery</strong>, <strong>Shiprocket</strong>, and <strong>India Post</strong>.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Once your order is dispatched, we will share the tracking number with you.</li>
                <li>Customers can use the tracking number to check the delivery status and estimated arrival time of their order.</li>
                <li>Delivery time may vary depending on your location and courier service availability.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase tracking-wide border-b-2 border-[#F5EFE6] pb-2 mb-4">Exchange Policy</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>Size exchanges are available within 24 hours of delivery if the selected size does not fit.</p>
              
              <h4 className="font-semibold text-[#1E2A44] uppercase tracking-wider text-xs mt-4">Conditions:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Exchange requests must be submitted within <strong>24 hours</strong> after delivery.</li>
                <li>The jersey must be unused and in its original condition.</li>
                <li><strong>Jerseys with Name & Number customization are NOT eligible for exchange.</strong></li>
                <li>The customer is responsible for both forward and return shipping charges for size exchanges.</li>
                <li><strong>An uncut unboxing video is mandatory</strong> for any damage, wrong product, or manufacturing defect claim.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase tracking-wide border-b-2 border-[#F5EFE6] pb-2 mb-4">Product Availability Notice</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>Due to high demand and inventory updates from our sourcing partners, some products or sizes may occasionally become unavailable after an order is placed.</p>
              <p>In such rare cases, our team will contact you promptly with the available alternatives, restock updates, or refund options if applicable.</p>
              <p>We appreciate your understanding and support.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase tracking-wide border-b-2 border-[#F5EFE6] pb-2 mb-4">Product Images Disclaimer</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>Product images shown on our website and social media are for illustration purposes only.</li>
                <li>Actual product color, design placement, or minor details may vary slightly due to lighting, screen settings, and manufacturing variations.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold uppercase tracking-wide border-b-2 border-[#F5EFE6] pb-2 mb-4">About Our Products</h3>
            <div className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>We deal in re-circulated football wear sourced from collectors and fan communities.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
