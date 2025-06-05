import React, { useRef, useEffect } from "react";
import * as dfd from "danfojs";
import * as d3 from "d3";

interface Props {
  dataFrame: dfd.DataFrame;
  selectedKey: string;
}

const Rangos: React.FC<Props> = ({ dataFrame, selectedKey }) => {
  const histogramRef = useRef<SVGSVGElement>(null);

  // Obtener datos
  const values = dataFrame[selectedKey].values as number[];
  const geoids = dataFrame["GEOID"].values as string[];
  const totalPopulation = dataFrame["total_population"].values as number[];

  // Calcular estadísticas
  const nonNullValues: number[] = values.filter((v): v is number => !isNaN(v));
  const uniqueValues = new Set(nonNullValues).size;

  const min = Math.min(...nonNullValues);
  const max = Math.max(...nonNullValues);
  const sorted = [...nonNullValues].sort((a: number, b: number) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const mean = nonNullValues.reduce((a: number, b: number) => a + b, 0) / nonNullValues.length;

  // Calcular promedio ponderado
  let weightedSum = 0;
  let totalPop = 0;
  values.forEach((val: number, index: number) => {
    if (!isNaN(val)) {
      weightedSum += val * totalPopulation[index];
      totalPop += totalPopulation[index];
    }
  });
  const weightedAvg = totalPop > 0 ? weightedSum / totalPop : 0;

  useEffect(() => {
    if (!histogramRef.current || nonNullValues.length === 0) return;

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
      .thresholds(20)(nonNullValues);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 1])
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
      .text(selectedKey);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Frecuencia");
  }, [selectedKey, nonNullValues, min, max]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#5c3d7a", width: "90%", maxWidth: "800px", marginTop: "20px" }}>
      <h2 style={{ color: "#f9f9f9", borderBottom: "2px solid #4e79a7", paddingBottom: "10px", marginBottom: "20px" }}>
        Distribución y estadísticos de {selectedKey.replace('_', ' ')}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <h3>Frecuencia de valores</h3>
          <svg ref={histogramRef}></svg>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginTop: "20px" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3>Estadísticas descriptivas</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td><strong>Valores no nulos:</strong></td><td>{nonNullValues.length}</td></tr>
              <tr><td><strong>Valores únicos:</strong></td><td>{uniqueValues}</td></tr>
              <tr><td><strong>Mínimo:</strong></td><td>{min.toFixed(6)}</td></tr>
              <tr><td><strong>25% (Q1):</strong></td><td>{q1.toFixed(6)}</td></tr>
              <tr><td><strong>50% (Mediana):</strong></td><td>{median.toFixed(6)}</td></tr>
              <tr><td><strong>Promedio:</strong></td><td>{mean.toFixed(6)}</td></tr>
              <tr><td><strong>Prom. ponderado:</strong></td><td>{weightedAvg.toFixed(6)}</td></tr>
              <tr><td><strong>75% (Q3):</strong></td><td>{q3.toFixed(6)}</td></tr>
              <tr><td><strong>Máximo:</strong></td><td>{max.toFixed(6)}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3>Distribución por región (GEOID)</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th>GEOID</th><th style={{ textAlign: "right" }}>Valor</th></tr>
              </thead>
              <tbody>
                {values.slice(0, 10).map((val: number, index: number) => (
                  <tr key={index}>
                    <td>{geoids[index]}</td>
                    <td style={{ textAlign: "right" }}>{isNaN(val) ? "N/A" : val.toFixed(6)}</td>
                  </tr>
                ))}
                {values.length > 10 && (
                  <tr><td colSpan={2} style={{ textAlign: "center", fontStyle: "italic" }}>y {values.length - 10} regiones más...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rangos;
