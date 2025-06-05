import React from "react";

interface Props {
  dataFrame: any; // Puedes especificar el tipo según lo que necesites
}

const DateComponente: React.FC<Props> = ({ dataFrame }) => {
  return (
    <div>
      <h3>Componente de Fecha</h3>
      <p>Aquí puedes visualizar o manipular las fechas.</p>

      <h3>Componente 2</h3>
      <p>Filas: {dataFrame.shape[0]}</p>
      <p>Columnas: {dataFrame.shape[1]}</p>
      {/* Añadir cualquier funcionalidad adicional para el atributo de tipo "date_range" */}
    </div>
  );
};

export default DateComponente;
