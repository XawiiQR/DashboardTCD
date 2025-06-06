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
  key: string;
}

const Grafica2: React.FC<Props> = ({ dataFrame }) => {
  const svgRef1 = useRef<SVGSVGElement | null>(null); // Mantener `null` como valor inicial para referencias
  const svgRef2 = useRef<SVGSVGElement | null>(null);
  const legendRef1 = useRef<HTMLDivElement | null>(null); // Mantener `null` como valor inicial
  const legendRef2 = useRef<HTMLDivElement | null>(null); // Mantener `null` como valor inicial
  const [selectedData, setSelectedData] = useState<{
    dataFrame: dfd.DataFrame;
    key: string;
  } | null>(null);

  // Color scheme for income brackets
  const colors = {
    under50k: "#4e79a7",
    fiftyTo100k: "#f28e2b",
    hundredTo200k: "#e15759",
    over200k: "#76b7b2",
  };

  // Calculate weighted averages
  let weighted0k50k = 0;
  let weighted50k100k = 0;
  let weighted100k200k = 0;
  let weighted200kmas = 0;
  let totalPopulation = 0;

  let weighted0k50kInflow = 0;
  let weighted50k100kInflow = 0;
  let weighted100k200kInflow = 0;
  let weighted200kmasInflow = 0;

  dataFrame["total_population_CT"].values.forEach(
    (population: number, index: number) => {
      weighted0k50k += dataFrame["Under $50K_CT"].values[index] * population;
      weighted50k100k +=
        dataFrame["$50K - $100K_CT"].values[index] * population;
      weighted100k200k +=
        dataFrame["$100K - $200K_CT"].values[index] * population;
      weighted200kmas += dataFrame["Over $200K_CT"].values[index] * population;

      weighted0k50kInflow +=
        dataFrame["Under $50K_inflow_CT"].values[index] * population;
      weighted50k100kInflow +=
        dataFrame["$50K - $100K_inflow_CT"].values[index] * population;
      weighted100k200kInflow +=
        dataFrame["$100K - $200K_inflow_CT"].values[index] * population;
      weighted200kmasInflow +=
        dataFrame["Over $200K_inflow_CT"].values[index] * population;

      totalPopulation += population;
    }
  );

  // Data for pie charts
  const incomeData: PieData[] = [
    {
      label: "Under $50K_CT",
      value: (weighted0k50k / totalPopulation) * 100,
      color: colors.under50k,
      key: "Under $50K_CT",
    },
    {
      label: "$50K - $100K_CT",
      value: (weighted50k100k / totalPopulation) * 100,
      color: colors.fiftyTo100k,
      key: "$50K - $100K_CT",
    },
    {
      label: "$100K - $200K_CT",
      value: (weighted100k200k / totalPopulation) * 100,
      color: colors.hundredTo200k,
      key: "$100K - $200K_CT",
    },
    {
      label: "Over $200K_CT",
      value: (weighted200kmas / totalPopulation) * 100,
      color: colors.over200k,
      key: "Over $200K_CT",
    },
  ];

  const inflowData: PieData[] = [
    {
      label: "Under $50K Inflow_CT",
      value: (weighted0k50kInflow / totalPopulation) * 100,
      color: colors.under50k,
      key: "Under $50K_inflow_CT",
    },
    {
      label: "$50K - $100K Inflow_CT",
      value: (weighted50k100kInflow / totalPopulation) * 100,
      color: colors.fiftyTo100k,
      key: "$50K - $100K_inflow_CT",
    },
    {
      label: "$100K - $200K Inflow_CT",
      value: (weighted100k200kInflow / totalPopulation) * 100,
      color: colors.hundredTo200k,
      key: "$100K - $200K_inflow_CT",
    },
    {
      label: "Over $200K Inflow_CT",
      value: (weighted200kmasInflow / totalPopulation) * 100,
      color: colors.over200k,
      key: "Over $200K_inflow_CT",
    },
  ];

  // Chart configuration
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
    svgRef: React.RefObject<SVGSVGElement | null>, // Mantener null como referencia inicial
    legendRef: React.RefObject<HTMLDivElement | null>, // Mantener null como referencia inicial
    data: PieData[],
    title: string,
    isInflow: boolean
  ) => {
    if (!svgRef.current || !legendRef.current) return;

    // Clear existing elements
    d3.select(svgRef.current!).selectAll("*").remove(); // Non-null assertion for svgRef
    legendRef.current!.innerHTML = ""; // Non-null assertion for legendRef

    // Create SVG
    const svg = d3
      .select(svgRef.current!)
      .attr("width", width)
      .attr("height", height + 40)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

    // Add title
    svg
      .append("text")
      .attr("y", -height / 2 - 10)
      .attr("text-anchor", "middle")
      .text(title)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#000");

    // Create pie layout
    const pie = d3.pie<PieData>().value((d) => d.value);
    const arc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw segments with interaction
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

    // Add percentages inside slices
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => (d.data.value > 5 ? `${d.data.value.toFixed(1)}%` : ""))
      .style("font-size", "10px")
      .style("fill", "#fff");

    // Create interactive legend
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

  // Draw charts when data changes
  useEffect(() => {
    drawPieChart(svgRef1, legendRef1, incomeData, "Income Distribution", false);
    drawPieChart(
      svgRef2,
      legendRef2,
      inflowData,
      "Income Inflow Distribution",
      true
    );
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

export default Grafica2;
