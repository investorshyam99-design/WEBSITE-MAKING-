const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add onEditPayment to AdminOrderCard props
  const oldProps = `function AdminOrderCard({
  order,
  activeTab,
  onUpdateStatus,
  onDelete,
  onUpdateTracking,
  onUpdatePrice,
  onUpdateCustomizationStatus,
}: {
  order: Order;
  activeTab: string;
  onUpdateStatus: (s: string) => void;
  onDelete: () => void;
  onUpdateTracking: (t: string, c: string, url: string) => void;
  onUpdatePrice: (p: number) => void;
  onUpdateCustomizationStatus: (status: string) => void;
}) {`;

  const newProps = `function AdminOrderCard({
  order,
  activeTab,
  onUpdateStatus,
  onDelete,
  onUpdateTracking,
  onUpdatePrice,
  onUpdateCustomizationStatus,
  onEditPayment,
}: {
  order: Order;
  activeTab: string;
  onUpdateStatus: (s: string) => void;
  onDelete: () => void;
  onUpdateTracking: (t: string, c: string, url: string) => void;
  onUpdatePrice: (p: number) => void;
  onUpdateCustomizationStatus: (status: string) => void;
  onEditPayment: (order: Order, calc: any) => void;
}) {`;

  content = content.replace(oldProps, newProps);
  
  // 2. Update AdminOrderCard usage to pass the prop
  const oldUsage = `<AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c, url) => handleUpdateTracking(order.id, t, c, url)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}
            />`;
            
  const newUsage = `<AdminOrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={(s) => handleUpdateStatus(order.id, s)}
              onDelete={() => handleDelete(order.id)}
              onUpdateTracking={(t, c, url) => handleUpdateTracking(order.id, t, c, url)}
              onUpdatePrice={(p) => handleUpdatePrice(order.id, p)}
              onUpdateCustomizationStatus={(s) => handleUpdateCustomizationStatus(order.id, s)}
              onEditPayment={(orderToEdit, calc) => {
                setEditingPaymentOrder(orderToEdit);
                setPaymentEditTotal(String(calc.finalTotalAmount));
                setPaymentEditPaid(String(calc.amountPaid));
                setPaymentEditCod(String(calc.codAmount));
              }}
            />`;

  content = content.replace(oldUsage, newUsage);
  
  // 3. Update the button click inside AdminOrderCard
  const oldButton = `onClick={(e) => {
                      e.stopPropagation();
                      setEditingPaymentOrder(order);
                      setPaymentEditTotal(String(calc.finalTotalAmount));
                      setPaymentEditPaid(String(calc.amountPaid));
                      setPaymentEditCod(String(calc.codAmount));
                    }}`;
                    
  const newButton = `onClick={(e) => {
                      e.stopPropagation();
                      onEditPayment(order, calc);
                    }}`;

  content = content.replace(oldButton, newButton);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filePath}`);
}

patchFile('src/components/AdminDashboard.tsx');
