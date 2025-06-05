import React, { useRef, useEffect } from "react";
import * as dfd from "danfojs";
import * as d3 from "d3";

interface Props {
  dataFrame: dfd.DataFrame;
  attribute: string;
}

const Rangos2: React.FC<Props> = ({ dataFrame, attribute }) => {
  const histogramRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);

  const rawValues = dataFrame[attribute]?.values as (number | null | undefined)[];
  const values: number[] = rawValues?.filter((v): v is number => v !== null && !isNaN(v)) || [];
  const totalPopulation = (dataFrame["total_population"]?.values || []) as number[];

  const nullCount = rawValues?.length - values.length || 0;
  const uniqueValues = new Set(values).size;

  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const sorted = [...values].sort((a: number, b: number) => a - b);
  const q1 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.25)] : 0;
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] : 0;
  const q3 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.75)] : 0;
  const mean = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;

  let weightedSum = 0;
  let totalPop = 0;
  if (totalPopulation.length > 0) {
    values.forEach((val: number, index: number) => {
      weightedSum += val * (totalPopulation[index] || 0);
      totalPop += totalPopulation[index] || 0;
    });
  }
  const weightedAvg = totalPop > 0 ? weightedSum / totalPop : 0;

  useEffect(() => {
    if (!histogramRef.current || values.length === 0) return;

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const svg = d3.select(histogramRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const x = d3.scaleLinear()
      .domain([min, max] as [number, number])
      .range([margin.left, width - margin.right]);

    const bins = d3.bin()
      .domain(x.domain() as [number, number])
      .thresholds(20)(values);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) || 1])
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0 ?? 0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1)
      .attr("height", d => height - margin.bottom - y(d.length))
      .attr("fill", "#4e79a7");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text(attribute);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Frecuencia");
  }, [attribute, values, min, max]);

  useEffect(() => {
    if (!pieChartRef.current) return;

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(pieChartRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const data = [
      { label: "No nulos", value: values.length, color: "#4e79a7" },
      { label: "Nulos", value: nullCount, color: "#e15759" }
    ];

    const pie = d3.pie<{ value: number }>().value((d) => d.value);
    const arc = d3.arc<d3.PieArcDatum<{ value: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = g.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d: any) => d.data.color);

    arcs.append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => (d.data.value > 0 ? `${d.data.value}` : ""))
      .style("fill", "white")
      .style("font-size", "12px");
  }, [nullCount, values.length]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#5c3d7a", width: "90%", maxWidth: "800px", marginTop: "20px" }}>
      <h2 style={{ color: "#f9f9f9", borderBottom: "2px solid #4e79a7", paddingBottom: "10px", marginBottom: "20px" }}>
        Distribución y estadísticos de {attribute.replace('_', ' ')}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <h3 style={{ color: "#f9f9f9" }}>Frecuencia de valores</h3>
          <svg ref={histogramRef}></svg>
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3 style={{ color: "#f9f9f9" }}>Estadísticas descriptivas</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Valores no nulos:</strong></td><td style={{ color: "#f9f9f9" }}>{values.length}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Valores únicos:</strong></td><td style={{ color: "#f9f9f9" }}>{uniqueValues}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Mínimo:</strong></td><td style={{ color: "#f9f9f9" }}>{min.toFixed(6)}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>25% (Q1):</strong></td><td style={{ color: "#f9f9f9" }}>{q1.toFixed(6)}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>50% (Mediana):</strong></td><td style={{ color: "#f9f9f9" }}>{median.toFixed(6)}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Promedio:</strong></td><td style={{ color: "#f9f9f9" }}>{mean.toFixed(6)}</td></tr>
              {totalPopulation.length > 0 && <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Prom. ponderado:</strong></td><td style={{ color: "#f9f9f9" }}>{weightedAvg.toFixed(6)}</td></tr>}
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>75% (Q3):</strong></td><td style={{ color: "#f9f9f9" }}>{q3.toFixed(6)}</td></tr>
              <tr><td style={{ padding: "5px", color: "#f9f9f9" }}><strong>Máximo:</strong></td><td style={{ color: "#f9f9f9" }}>{max.toFixed(6)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rangos2;