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
  const svgRef1 = useRef<SVGSVGElement | null>(null); // Mantener `null` como valor inicial para referencias
  const svgRef2 = useRef<SVGSVGElement | null>(null);
  const legendRef1 = useRef<HTMLDivElement | null>(null); // Mantener `null` como valor inicial
  const legendRef2 = useRef<HTMLDivElement | null>(null); // Mantener `null` como valor inicial
  const [selectedData, setSelectedData] = useState<{
    dataFrame: dfd.DataFrame;
    key: string;
  } | null>(null);

  const colors = {
    white: "#4e79a7",
    black: "#f28e2b",
    asian: "#e15759",
    hispanic: "#76b7b2",
  };

  let weightedWhite = 0;
  let weightedBlack = 0;
  let weightedAsian = 0;
  let weightedHispanic = 0;
  let totalPopulation = 0;

  let weightedWhite_inflow = 0;
  let weightedBlack_inflow = 0;
  let weightedAsian_inflow = 0;
  let weightedHispanic_inflow = 0;

  dataFrame["total_population_CT"].values.forEach(
    (population: number, index: number) => {
      weightedWhite += dataFrame["white_CT"].values[index] * population;
      weightedBlack += dataFrame["black_CT"].values[index] * population;
      weightedAsian += dataFrame["asian_CT"].values[index] * population;
      weightedHispanic += dataFrame["hispanic_CT"].values[index] * population;

      weightedWhite_inflow +=
        dataFrame["white_inflow_CT"].values[index] * population;
      weightedBlack_inflow +=
        dataFrame["black_inflow_CT"].values[index] * population;
      weightedAsian_inflow +=
        dataFrame["asian_inflow_CT"].values[index] * population;
      weightedHispanic_inflow +=
        dataFrame["hispanic_inflow_CT"].values[index] * population;

      totalPopulation += population;
    }
  );

  const raceData: PieData[] = [
    {
      label: "White_CT",
      value: (weightedWhite / totalPopulation) * 100,
      color: colors.white,
      key: "white_CT",
    },
    {
      label: "Black_CT",
      value: (weightedBlack / totalPopulation) * 100,
      color: colors.black,
      key: "black_CT",
    },
    {
      label: "Asian_CT",
      value: (weightedAsian / totalPopulation) * 100,
      color: colors.asian,
      key: "asian_CT",
    },
    {
      label: "Hispanic_CT",
      value: (weightedHispanic / totalPopulation) * 100,
      color: colors.hispanic,
      key: "hispanic_CT",
    },
  ];

  const inflowData: PieData[] = [
    {
      label: "White Inflow_CT",
      value: (weightedWhite_inflow / totalPopulation) * 100,
      color: colors.white,
      key: "white_inflow_CT",
    },
    {
      label: "Black Inflow_CT",
      value: (weightedBlack_inflow / totalPopulation) * 100,
      color: colors.black,
      key: "black_inflow_CT",
    },
    {
      label: "Asian Inflow_CT",
      value: (weightedAsian_inflow / totalPopulation) * 100,
      color: colors.asian,
      key: "asian_inflow_CT",
    },
    {
      label: "Hispanic Inflow_CT",
      value: (weightedHispanic_inflow / totalPopulation) * 100,
      color: colors.hispanic,
      key: "hispanic_inflow_CT",
    },
  ];

  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 20;

  const handleSegmentClick = (data: PieData, _isInflow: boolean) => {
    setSelectedData({
      dataFrame: dataFrame,
      key: data.key,
    });
  };

  const drawPieChart = (
    svgRef: React.RefObject<SVGSVGElement | null>,
    legendRef: React.RefObject<HTMLDivElement | null>, // Usamos el tipo HTMLDivElement | null para las leyendas
    data: PieData[],
    title: string,
    isInflow: boolean
  ) => {
    if (!svgRef.current || !legendRef.current) return;

    d3.select(svgRef.current!).selectAll("*").remove(); // Non-null assertion for svgRef
    legendRef.current!.innerHTML = ""; // Non-null assertion for legendRef

    const svg = d3
      .select(svgRef.current!)
      .attr("width", width)
      .attr("height", height + 40)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

    svg
      .append("text")
      .attr("y", -height / 2 - 10)
      .attr("text-anchor", "middle")
      .text(title)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#000");

    const pie = d3.pie<PieData>().value((d) => d.value);
    const arc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer")
      .on("click", (_event, d) => handleSegmentClick(d.data, isInflow));

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#fff")
      .style("stroke-width", "1px")
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      });

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => (d.data.value > 5 ? `${d.data.value.toFixed(1)}%` : ""))
      .style("font-size", "10px")
      .style("fill", "#fff");

    const legend = d3
      .select(legendRef.current!)
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "5px")
      .style("margin-top", "10px");

    data.forEach((item) => {
      const legendItem = legend
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "5px")
        .style("cursor", "pointer")
        .on("click", () => handleSegmentClick(item, isInflow))
        .on("mouseover", function () {
          d3.select(this).style("opacity", 0.8);
        })
        .on("mouseout", function () {
          d3.select(this).style("opacity", 1);
        });

      legendItem
        .append("div")
        .style("width", "15px")
        .style("height", "15px")
        .style("background", item.color);

      legendItem
        .append("span")
        .text(`${item.label}: ${item.value.toFixed(1)}%`);
    });
  };

  useEffect(() => {
    drawPieChart(svgRef1, legendRef1, raceData, "Distribución Racial", false);
    drawPieChart(svgRef2, legendRef2, inflowData, "Distribución Inflow", true);
  }, [dataFrame]);

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
          flexWrap: "wrap",
          gap: "40px",
          justifyContent: "center",
        }}
      >
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
        <Rangos
          dataFrame={selectedData.dataFrame}
          selectedKey={selectedData.key}
        />
      )}
    </div>
  );
};

export default Grafica;
