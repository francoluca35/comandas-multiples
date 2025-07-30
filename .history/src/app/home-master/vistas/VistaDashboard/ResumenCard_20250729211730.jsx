import CardEstadistica from "./CardEstadistica";
import { FaShoppingCart, FaMoneyBillAlt, FaStore } from "react-icons/fa";

export default function ResumenCards() {
  const resumen = [
    {
      icon: FaShoppingCart,
      label: "Pedidos",
      valor: 128,
      color: "text-blue-400",
    },
    {
      icon: FaMoneyBillAlt,
      label: "Pagos",
      valor: "$5,230",
      color: "text-green-400",
    },
    { icon: FaStore, label: "Locales", valor: 5, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {resumen.map((item, idx) => (
        <CardEstadistica key={idx} {...item} />
      ))}
    </div>
  );
}
