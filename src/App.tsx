import React, { useState, useEffect } from "react";
import "./App.css";
import DanfoExample from "./DanfoExample";
import BarraLateral from "./BarraLateral";
import * as dfd from "danfojs";

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [dataFrame, setDataFrame] = useState<dfd.DataFrame | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const loadData = async (fileName: string) => {
    try {
      const df = await dfd.readCSV(`/${fileName}`);
      setDataFrame(df);
    } catch (err) {
      console.error("Error al cargar archivo:", err);
      setDataFrame(null);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      loadData(selectedFile);
    }
  }, [selectedFile]);

  return (
    <div className="container">
      <div className="left-side">
        <h1>DashBoard AED</h1>

        <div className="danfo-wrapper">
          <DanfoExample setSelectedFile={setSelectedFile} />
        </div>

        <div className="botonera">
          <button onClick={() => setActiveButton("Botón 1")}>Atributos</button>
          <button onClick={() => setActiveButton("Botón 2")}>Registros</button>
          <button onClick={() => setActiveButton("Botón 3")}>Relaciones</button>
        </div>
      </div>

      <div className="right-side">
        <BarraLateral
          dataFrame={dataFrame}
          activeButton={activeButton}
          selectedFile={selectedFile}
        />
      </div>
    </div>
  );
};

export default App;
