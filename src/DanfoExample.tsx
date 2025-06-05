import React from "react";

interface Props {
  setSelectedFile: (fileName: string) => void;
}

const DanfoExample: React.FC<Props> = ({ setSelectedFile }) => {
  return (
    <div>
      <h2>Seleccionar dataset</h2>
      <button onClick={() => setSelectedFile("Boston_feature_df.csv")}>
        Cargar Boston Features
      </button>
      <button onClick={() => setSelectedFile("BostonMobility2021.csv")}>
        Cargar Boston Mobility
      </button>
    </div>
  );
};

export default DanfoExample;
