const fs = require('fs');

const file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const moveLogic = `  const handleMoveAllToPlaced = async () => {
    setIsMovingAll(true);
    setMoveResults([]);
    const results = [];
    for (const order of group.orders) {
      try {
        onUpdateStatus(order.id, "Order Placed");
        results.push({ id: order.orderNumber || order.id, success: true, msg: "Moved successfully" });
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    setMoveResults(results);
    setIsMovingAll(false);
  };`;

const markDeliveredLogic = `
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  
  const handleMarkAllDelivered = async () => {
    setIsMarkingDelivered(true);
    setMoveResults([]);
    const results = [];
    for (const order of group.orders) {
      if (String(order.status).toLowerCase() === "delivered") {
         results.push({ id: order.orderNumber || order.id, success: false, msg: "Already delivered" });
         continue;
      }
      try {
        onUpdateStatus(order.id, "Delivered");
        results.push({ id: order.orderNumber || order.id, success: true, msg: "Marked as Delivered" });
      } catch (err: any) {
        results.push({ id: order.orderNumber || order.id, success: false, msg: err.message });
      }
    }
    setMoveResults(results);
    setIsMarkingDelivered(false);
  };
`;

content = content.replace(moveLogic, moveLogic + '\\n' + markDeliveredLogic);

const oldButtons = `        {activeTab === "new" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => setShowConfirmFulfill(true)}
              disabled={isFulfillingAll}
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isFulfillingAll ? "Processing..." : "Fulfill With Delhivery — All Orders"}
            </button>
            <button
              onClick={handleMoveAllToPlaced}
              disabled={isMovingAll}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMovingAll ? "Moving..." : "Move All Orders To Order Placed"}
            </button>
          </div>
        )}`;

const newButtons = `        {activeTab === "new" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => setShowConfirmFulfill(true)}
              disabled={isFulfillingAll}
              className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isFulfillingAll ? "Processing..." : "Fulfill With Delhivery — All Orders"}
            </button>
            <button
              onClick={handleMoveAllToPlaced}
              disabled={isMovingAll}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMovingAll ? "Moving..." : "Move All Orders To Order Placed"}
            </button>
          </div>
        )}
        {activeTab === "placed" && group.orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={handleMarkAllDelivered}
              disabled={isMarkingDelivered}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {isMarkingDelivered ? "Marking..." : "Mark All Orders Delivered"}
            </button>
          </div>
        )}`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync(file, content, 'utf8');
console.log('Update buttons complete');
