import React from "react";
import * as dfd from "danfojs";

interface Props {
  dataFrame: dfd.DataFrame;
}

const Componente3: React.FC<Props> = ({ dataFrame }) => {
  return (
    <div>
      <h3>Componente 3</h3>
      <p>Filas: {dataFrame.shape[0]}</p>
      <p>Columnas: {dataFrame.shape[1]}</p>

      {/* Mostrar las primeras 3 filas */}
      <h4>Primeras 3 filas:</h4>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {dataFrame.head(3).toString()}
      </pre>
    </div>
  );
};

export default Componente3;
