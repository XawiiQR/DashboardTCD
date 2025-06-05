import React from "react";
import * as dfd from "danfojs";
import Componente1 from "./Componente1";
import Componente2 from "./Componente2";
import Componente3 from "./Componente3";
import Componente4 from "./Componente4";

interface Props {
  dataFrame: dfd.DataFrame | null;
  activeButton: string | null;
  selectedFile: string | null;
}

const BarraLateral: React.FC<Props> = ({
  dataFrame,
  activeButton,
  selectedFile,
}) => {
  // Función para decidir qué componente renderizar
  const renderComponent = () => {
    if (!activeButton || !dataFrame || !selectedFile)
      return <p>No hay acción seleccionada.</p>;

    // Combinación de botón y dataset
    if (selectedFile === "Boston_feature_df.csv") {
      switch (activeButton) {
        case "Botón 1":
          return <Componente1 dataFrame={dataFrame} />;
        case "Botón 2":
          return <Componente2 dataFrame={dataFrame} />;
        case "Botón 3":
          return <Componente3 dataFrame={dataFrame} />;
        default:
          return <p>No se ha seleccionado ningún botón válido.</p>;
      }
    } else if (selectedFile === "BostonMobility2021.csv") {
      switch (activeButton) {
        case "Botón 1":
          return <Componente4 dataFrame={dataFrame} />;
        case "Botón 2":
          return <Componente4 dataFrame={dataFrame} />;
        case "Botón 3":
          return <Componente4 dataFrame={dataFrame} />;
        default:
          return <p>No se ha seleccionado ningún botón válido.</p>;
      }
    }
  };

  return (
    <div>
      <h2>Vista previa del CSV</h2>

      {dataFrame ? (
        <>
          {renderComponent()}
          <p>
            <strong>Acción:</strong>{" "}
            {activeButton
              ? `${activeButton} de ${selectedFile}`
              : "No se ha presionado un botón aún"}
          </p>

          <p>
            <strong>Filas:</strong> {dataFrame.shape[0]} |{" "}
            <strong>Columnas:</strong> {dataFrame.shape[1]}
          </p>
          {/* ... 
          <h4>Primeros 5 registros</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {dataFrame.head(5).toString()}
          </pre>
          */}
          {/* Renderiza el componente basado en la combinación de botón y dataset */}
        </>
      ) : (
        <p>No hay dataset cargado</p>
      )}
    </div>
  );
};

export default BarraLateral;
