import React, { useState } from "react";
import * as dfd from "danfojs";
import Mapa from "./Mapa"; // Asegúrate de tener este archivo
import Grafica from "./Grafica"; // Asegúrate de tener este archivo
import "./Componente1.css";
import Grafica2 from "./Grafica2";
import Grafica3 from "./Grafica3";
interface Props {
  dataFrame: dfd.DataFrame;
}

const Componente1: React.FC<Props> = ({ dataFrame }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );

  const handleButtonClick = (category: string) => {
    console.log("Botón presionado:", category);
    setSelectedComponent(category); // Cambiar el componente según el botón
  };

  return (
    <div>
      {/* Contenedor de botones */}
      <h4>Seleccionar categoría:</h4>
      <div className="button-container">
        <button
          className="category-button"
          onClick={() => handleButtonClick("Geo")}
        >
          Geo
        </button>
        <button
          className="category-button"
          onClick={() => handleButtonClick("Racial")}
        >
          Racial
        </button>
        <button
          className="category-button"
          onClick={() => handleButtonClick("Income")}
        >
          Income
        </button>
        <button
          className="category-button"
          onClick={() => handleButtonClick("PI")}
        >
          PI
        </button>
      </div>
      <div>
        {/* Mostrar el componente basado en el botón presionado */}
        {selectedComponent === "Geo" && <Mapa dataFrame={dataFrame} />}
        {selectedComponent === "Racial" && <Grafica dataFrame={dataFrame} />}
        {selectedComponent === "Income" && <Grafica2 dataFrame={dataFrame} />}
        {selectedComponent === "PI" && <Grafica3 dataFrame={dataFrame} />}
      </div>

      

      <h3>Componente 1</h3>
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

export default Componente1;
