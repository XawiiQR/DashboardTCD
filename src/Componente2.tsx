import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Props {
  dataFrame: any;
}

interface RacialData {
  label: string;
  value: number;
  color: string;
}

const Componente2: React.FC<Props> = ({ dataFrame }) => {
  // Obtener todos los GEOIDs disponibles
  const geoids = dataFrame["tract_id"].values;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  // Colores para cada categoría
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"];

  // Calcular los porcentajes basados en el índice seleccionado
  const calculatePercentages = (index: number): RacialData[] => {
    if (index < 0 || index >= geoids.length) return [];

    const population = dataFrame["total_population_CT"].values[index];
    if (population === 0) return [];

    return [
      {
        label: "White_CT",
        value: dataFrame["white_CT"].values[index] * 100,
        color: colors[0],
      },
      {
        label: "Black_CT",
        value: dataFrame["black_CT"].values[index] * 100,
        color: colors[1],
      },
      {
        label: "Asian_CT",
        value: dataFrame["asian_CT"].values[index] * 100,
        color: colors[2],
      },
      {
        label: "Hispanic_CT",
        value: dataFrame["hispanic_CT"].values[index] * 100,
        color: colors[3],
      },
    ];
  };

  const data = calculatePercentages(selectedIndex);

  // Dibujar el gráfico de pastel
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Limpiar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove();

    // Configuración del gráfico
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    interface PieArcDatum {
      data: RacialData;
      index: number;
      value: number;
      startAngle: number;
      endAngle: number;
      padAngle: number;
    }
    // Generador de arco
    const arc = d3
      .arc<PieArcDatum>()
      .innerRadius(0)
      .outerRadius(radius * 0.8);

    // Generador de pie
    const pie = d3
      .pie<RacialData>()
      .value((d) => d.value)
      .sort(null);

    // Dibujar los segmentos
    const arcs = svg.selectAll("arc").data(pie(data)).enter().append("g");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Añadir porcentajes dentro del gráfico
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => (d.data.value > 5 ? `${d.data.value.toFixed(1)}%` : ""))
      .style("font-size", "12px")
      .style("fill", "white");

    // Actualizar la leyenda
    updateLegend(data);
  }, [data]);

  // Actualizar la leyenda
  const updateLegend = (data: RacialData[]) => {
    if (!legendRef.current) return;

    legendRef.current.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
        <h4 style="margin-bottom: 10px;">Leyenda (GEOID: ${
          geoids[selectedIndex]
        })</h4>
        ${data
          .map(
            (item) => `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; background-color: ${
              item.color
            };"></div>
            <span>${item.label}: ${item.value.toFixed(1)}%</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  // Manejador para el cambio del slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndex(Number(e.target.value));
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h4>Distribución de Población por Raza</h4>

      {/* Slider para seleccionar el GEOID */}
      <div style={{ width: "400px", margin: "20px 0" }}>
        <input
          type="range"
          min="0"
          max={geoids.length - 1}
          value={selectedIndex}
          onChange={handleSliderChange}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>GEOID: {geoids[0]}</span>
          <span>GEOID: {geoids[geoids.length - 1]}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: "5px" }}>
          GEOID seleccionado: <strong>{geoids[selectedIndex]}</strong>
        </div>
      </div>

      {/* Contenedor principal */}
      <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
        {/* Gráfico de pastel */}
        <svg ref={svgRef} style={{ width: "400px", height: "400px" }}></svg>

        {/* Leyenda */}
        <div ref={legendRef}></div>
      </div>
    </div>
  );
};

export default Componente2;
