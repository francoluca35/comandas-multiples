import React from "react";
import TableCard from "./TableCard";

function MesasGrid({ tables, onEditTable, onDeleteTable }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={() => onEditTable(table)}
          onDelete={() => onDeleteTable(table)}
        />
      ))}
    </div>
  );
}

export default MesasGrid;
