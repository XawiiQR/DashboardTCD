import React from "react";

interface Props {
  setSelectedFile: (fileName: string) => void;
}

const DanfoExample: React.FC<Props> = ({ setSelectedFile }) => {
  return (
    <div>
      <h2>Seleccionar dataset</h2>
      <button onClick={() => setSelectedFile("BostonFeatureCT.csv")}>
        Cargar Boston Features
      </button>
      <button onClick={() => setSelectedFile("BostonMovilityMes.csv")}>
        Cargar Boston Mobility
      </button>
    </div>
  );
};

export default DanfoExample;
