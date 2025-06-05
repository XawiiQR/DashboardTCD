import React, { useState } from "react";
import * as dfd from "danfojs";
import Rangos2 from "./Rangos2"; // Asegúrate de tener este componente
import DateComponente from "./DateComponente";
import "./Componente1.css"; // Reutilizando los estilos

interface Props {
  dataFrame: dfd.DataFrame;
}

const Componente4: React.FC<Props> = ({ dataFrame }) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);

  // Obtener los nombres de las columnas del DataFrame
  const attributes = dataFrame.columns;

  const handleButtonClick = (attribute: string) => {
    console.log("Atributo seleccionado:", attribute);
    setSelectedAttribute(attribute);
  };

  return (
    <div>
      {/* Contenedor de botones dinámicos */}
      <h4>Seleccionar atributo:</h4>
      <div className="button-container">
        {attributes.map((attr) => (
          <button
            key={attr}
            className="category-button"
            onClick={() => handleButtonClick(attr)}
          >
            {attr}
          </button>
        ))}
      </div>

      {/* Mostrar el componente adecuado según el atributo seleccionado */}
      {selectedAttribute && selectedAttribute === "date_range" ? (
        <DateComponente dataFrame={dataFrame} />
      ) : (
        selectedAttribute && <Rangos2 dataFrame={dataFrame} attribute={selectedAttribute} />
      )}

      <h3>Componente 4</h3>
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

export default Componente4;
/*esta bien*/