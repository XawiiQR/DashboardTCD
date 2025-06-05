import React from "react";
import * as dfd from "danfojs";

interface Props {
  dataFrame: dfd.DataFrame;
}

const Componente2: React.FC<Props> = ({ dataFrame }) => {
  return (
    <div>
      <h3>Componente 2</h3>
      <p>Filas: {dataFrame.shape[0]}</p>
      <p>Columnas: {dataFrame.shape[1]}</p>

      {/* Mostrar la descripción del dataset */}
      <h4>Descripción del dataset:</h4>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {dataFrame.head(10).toString()}
      </pre>
    </div>
  );
};

export default Componente2;
