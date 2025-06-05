import React, { useEffect, useRef, useState } from "react";
import * as dfd from "danfojs";
import * as d3 from "d3";
import Rangos from "./Rangos";

interface Props {
  dataFrame: dfd.DataFrame;
}

interface PieData {
  label: string;
  value: number;
  color: string;
  key: string; // Nueva propiedad para identificar el dato
}

const Grafica: React.FC<Props> = ({ dataFrame }) => {
  const svgRef1 = useRef<SVGSVGElement>(null);
  const svgRef2 = useRef<SVGSVGElement>(null);
  const legendRef1 = useRef<HTMLDivElement>(null);
  const legendRef2 = useRef<HTMLDivElement>(null);
  const [selectedData, setSelectedData] = useState<{dataFrame: dfd.DataFrame, key: string} | null>(null);

  // Colores consistentes para las categorías
  const colors = {
    white: "#4e79a7",
    black: "#f28e2b",
    asian: "#e15759",
    hispanic: "#76b7b2"
  };

  // Calcular el total ponderado de cada raza
  let weightedWhite = 0;
  let weightedBlack = 0;
  let weightedAsian = 0;
  let weightedHispanic = 0;
  let totalPopulation = 0;

  let weightedWhite_inflow = 0;
  let weightedBlack_inflow = 0;
  let weightedAsian_inflow = 0;
  let weightedHispanic_inflow = 0;

  // Iterar sobre cada registro y calcular el valor ponderado
  dataFrame["total_population"].values.forEach((population: number, index: number) => {
    weightedWhite += dataFrame["white"].values[index] * population;
    weightedBlack += dataFrame["black"].values[index] * population;
    weightedAsian += dataFrame["asian"].values[index] * population;
    weightedHispanic += dataFrame["hispanic"].values[index] * population;
   
    weightedWhite_inflow += dataFrame["white_inflow"].values[index] * population;
    weightedBlack_inflow += dataFrame["black_inflow"].values[index] * population;
    weightedAsian_inflow += dataFrame["asian_inflow"].values[index] * population;
    weightedHispanic_inflow += dataFrame["hispanic_inflow"].values[index] * population;

    totalPopulation += population;
  });

  // Datos para los gráficos
  const raceData: PieData[] = [
    { label: "White", value: (weightedWhite / totalPopulation) * 100, color: colors.white, key: "white" },
    { label: "Black", value: (weightedBlack / totalPopulation) * 100, color: colors.black, key: "black" },
    { label: "Asian", value: (weightedAsian / totalPopulation) * 100, color: colors.asian, key: "asian" },
    { label: "Hispanic", value: (weightedHispanic / totalPopulation) * 100, color: colors.hispanic, key: "hispanic" }
  ];

  const inflowData: PieData[] = [
    { label: "White Inflow", value: (weightedWhite_inflow / totalPopulation) * 100, color: colors.white, key: "white_inflow" },
    { label: "Black Inflow", value: (weightedBlack_inflow / totalPopulation) * 100, color: colors.black, key: "black_inflow" },
    { label: "Asian Inflow", value: (weightedAsian_inflow / totalPopulation) * 100, color: colors.asian, key: "asian_inflow" },
    { label: "Hispanic Inflow", value: (weightedHispanic_inflow / totalPopulation) * 100, color: colors.hispanic, key: "hispanic_inflow" }
  ];

  // Configuración de los gráficos
  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 20;

  // Función para manejar el click en un segmento
  const handleSegmentClick = (data: PieData, isInflow: boolean) => {
    setSelectedData({
      dataFrame: dataFrame,
      key: data.key
    });
  };

  // Función para dibujar un gráfico de pastel con leyenda
  const drawPieChart = (
    svgRef: React.RefObject<SVGSVGElement>,
    legendRef: React.RefObject<HTMLDivElement>,
    data: PieData[],
    title: string,
    isInflow: boolean
  ) => {
    if (!svgRef.current || !legendRef.current) return;

    // Limpiar SVG y leyenda existentes
    d3.select(svgRef.current).selectAll("*").remove();
    legendRef.current.innerHTML = '';

    // Crear SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height + 40)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

    // Añadir título
    svg.append("text")
      .attr("y", -height / 2 - 10)
      .attr("text-anchor", "middle")
      .text(title)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#000");

    // Crear el layout del pastel
    const pie = d3.pie<PieData>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Dibujar los segmentos con interacción
    const arcs = svg.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer")
      .on("click", (event, d) => handleSegmentClick(d.data, isInflow));

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#fff")
      .style("stroke-width", "1px")
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
      });

    // Añadir porcentajes dentro de las porciones
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text(d => d.data.value > 5 ? `${d.data.value.toFixed(1)}%` : "")
      .style("font-size", "10px")
      .style("fill", "#fff");

    // Crear leyenda interactiva
    const legend = d3.select(legendRef.current)
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "5px")
      .style("margin-top", "10px");

    data.forEach(item => {
      const legendItem = legend.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "5px")
        .style("cursor", "pointer")
        .on("click", () => handleSegmentClick(item, isInflow))
        .on("mouseover", function() {
          d3.select(this).style("opacity", 0.8);
        })
        .on("mouseout", function() {
          d3.select(this).style("opacity", 1);
        });

      legendItem.append("div")
        .style("width", "15px")
        .style("height", "15px")
        .style("background", item.color);

      legendItem.append("span")
        .text(`${item.label}: ${item.value.toFixed(1)}%`);
    });
  };

  // Dibujar los gráficos cuando los datos cambien
  useEffect(() => {
    drawPieChart(svgRef1, legendRef1, raceData, "Distribución Racial", false);
    drawPieChart(svgRef2, legendRef2, inflowData, "Distribución Inflow", true);
  }, [dataFrame]);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      padding: "20px"
    }}>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "40px", 
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <svg ref={svgRef1}></svg>
          <div ref={legendRef1}></div>
        </div>
        
        <div style={{ textAlign: "center" }}>
          <svg ref={svgRef2}></svg>
          <div ref={legendRef2}></div>
        </div>
      </div>

      {selectedData && (
        <Rangos dataFrame={selectedData.dataFrame} selectedKey={selectedData.key} />
      )}
    </div>
  );
};

export default Grafica;