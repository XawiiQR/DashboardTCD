import React, { useEffect, useRef, useState } from "react";
import * as dfd from "danfojs";
import * as d3 from "d3";
import Rangos from "./Rangos";

interface Props {
  dataFrame: dfd.DataFrame;
}

interface ActivityData {
  category: string;
  value: number;
  color: string;
  key: string;
}

const Grafica3: React.FC<Props> = ({ dataFrame }) => {
  const svgRef1 = useRef<SVGSVGElement | null>(null);
  const svgRef2 = useRef<SVGSVGElement | null>(null);
  const [selectedData, setSelectedData] = useState<{
    dataFrame: dfd.DataFrame;
    key: string;
  } | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<
    string | null
  >(null);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Categorías de actividades
  const activityCategories = [
    "Food_CT",
    "Shopping_CT",
    "Work_CT",
    "Health_CT",
    "Religious_CT",
    "Service_CT",
    "Entertainment_CT",
    "Grocery_CT",
    "Education_CT",
    "Arts/Museum_CT",
    "Transportation_CT",
    "Sports_CT",
  ];

  // Colores para las categorías
  const categoryColors = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc948",
    "#b07aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ac",
    "#8cd17d",
    "#d4a6c8",
  ];

  useEffect(() => {
    // Extraer los GEOIDs como nombres de vecindarios
    if (dataFrame) {
      const geoids = dataFrame["tract_id"].values as string[];
      setNeighborhoods(geoids); // Establecer los vecindarios en el estado
    }
  }, [dataFrame]);

  // Calcular promedios ponderados por población para cada categoría
  const calculateWeightedAverages = () => {
    const weightedAverages: ActivityData[] = [];
    let totalPopulation = 0;
    const sums: { [key: string]: number } = {};

    // Inicializar sumas
    activityCategories.forEach((cat) => {
      sums[cat] = 0;
    });

    // Calcular sumas ponderadas
    dataFrame["total_population_CT"].values.forEach(
      (population: number, index: number) => {
        activityCategories.forEach((cat) => {
          sums[cat] += dataFrame[cat].values[index] * population;
        });
        totalPopulation += population;
      }
    );

    // Calcular promedios
    activityCategories.forEach((cat, i) => {
      weightedAverages.push({
        category: cat,
        value: sums[cat] / totalPopulation,
        color: categoryColors[i],
        key: cat,
      });
    });

    return weightedAverages;
  };

  // Obtener datos para un vecindario específico
  const getNeighborhoodData = (geoid: string) => {
    const index = dataFrame["tract_id"].values.indexOf(geoid);
    if (index === -1) return [];

    return activityCategories.map((cat, i) => ({
      category: cat,
      value: dataFrame[cat].values[index],
      color: categoryColors[i],
      key: cat,
    }));
  };

  const handleBarClick = (data: ActivityData) => {
    setSelectedData({
      dataFrame: dataFrame,
      key: data.key,
    });
  };

  const handleNeighborhoodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedNeighborhood(e.target.value); // Actualizar el vecindario seleccionado
  };

  const drawBarChart = (
    svgRef: React.RefObject<SVGSVGElement | null>,
    data: ActivityData[],
    title: string
  ) => {
    if (!svgRef.current) return;

    // Clear existing elements
    d3.select(svgRef.current!).selectAll("*").remove(); // Non-null assertion for svgRef

    // Margins and dimensions
    const margin = { top: 50, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current!)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .text(title)
      .style("font-size", "16px")
      .style("font-weight", "bold");

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, width])
      .padding(0.2);

    // Y scale
    const maxValue = d3.max(data, (d) => d.value) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y));

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Visitas promedio")
      .style("font-size", "12px");

    // Create bars
    svg
      .selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.category) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => d.color)
      .style("cursor", "pointer")
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("opacity", 0.8);

        // Show tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (x(d.category) || 0) + x.bandwidth() / 2)
          .attr("y", y(d.value) - 5)
          .attr("text-anchor", "middle")
          .text(d.value.toFixed(2))
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", "#000");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
        svg.selectAll(".tooltip").remove();
      })
      .on("click", (_event, d) => handleBarClick(d));
  };

  // Dibujar gráficos cuando cambian los datos o la selección
  useEffect(() => {
    const weightedAverages = calculateWeightedAverages();
    drawBarChart(
      svgRef1,
      weightedAverages,
      "Promedio de Visitas por Categoría (Ponderado por Población)"
    );

    if (selectedNeighborhood) {
      const neighborhoodData = getNeighborhoodData(selectedNeighborhood);
      drawBarChart(
        svgRef2,
        neighborhoodData,
        `Visitas por Categoría en ${selectedNeighborhood}`
      );
    }
  }, [dataFrame, selectedNeighborhood]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Análisis de Movilidad y Actividades</h2>
          <p>
            Visualización de patrones de visita a diferentes tipos de lugares en
            Boston
          </p>
        </div>

        {/* Dropdown para seleccionar el vecindario */}
        <div>
          <label htmlFor="neighborhood-select">Seleccionar vecindario: </label>
          <select
            id="neighborhood-select"
            onChange={handleNeighborhoodChange} // Conectamos el manejador
            style={{ padding: "5px", borderRadius: "4px" }}
          >
            <option value="">-- Promedio de la ciudad --</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <svg ref={svgRef1}></svg>
        </div>

        {selectedNeighborhood && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            <svg ref={svgRef2}></svg>
          </div>
        )}
      </div>

      {selectedData && (
        <Rangos
          dataFrame={selectedData.dataFrame}
          selectedKey={selectedData.key}
        />
      )}
    </div>
  );
};

export default Grafica3;
