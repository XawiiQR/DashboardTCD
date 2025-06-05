import React, { useRef, useEffect } from "react";
import * as dfd from "danfojs";
import * as d3 from "d3";

interface Props {
  dataFrame: dfd.DataFrame;
  selectedKey: string;
}

const Rangos: React.FC<Props> = ({ dataFrame, selectedKey }) => {
  const histogramRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  
  // Obtener datos
  const values = dataFrame[selectedKey].values;
  const geoids = dataFrame["GEOID"].values;
  const totalPopulation = dataFrame["total_population"].values;
  
  // Calcular estadísticas
  const nonNullValues = values.filter(v => !isNaN(v));
  const nullCount = values.length - nonNullValues.length;
  const uniqueValues = new Set(nonNullValues).size;
  
  const min = Math.min(...nonNullValues);
  const max = Math.max(...nonNullValues);
  const sorted = [...nonNullValues].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const mean = nonNullValues.reduce((a, b) => a + b, 0) / nonNullValues.length;
  
  // Calcular promedio ponderado
  let weightedSum = 0;
  let totalPop = 0;
  values.forEach((val, index) => {
    if (!isNaN(val)) {
      weightedSum += val * totalPopulation[index];
      totalPop += totalPopulation[index];
    }
  });
  const weightedAvg = totalPop > 0 ? weightedSum / totalPop : 0;

  // Dibujar histograma
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
      .domain([min, max])
      .range([margin.left, width - margin.right]);
    
    const bins = d3.bin()
      .domain(x.domain())
      .thresholds(20)(nonNullValues);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 1])
      .range([height - margin.bottom, margin.top]);
    
    // Dibujar ejes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
    
    // Dibujar barras
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0 || 0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1 || 0) - x(d.x0 || 0) - 1)
      .attr("height", d => height - margin.bottom - y(d.length))
      .attr("fill", "#4e79a7");
    
    // Etiquetas
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

  // Dibujar gráfico de pastel para nulos/no nulos
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
      { label: "No nulos", value: nonNullValues.length, color: "#4e79a7" },
      { label: "Nulos", value: nullCount, color: "#e15759" }
    ];
    
    const pie = d3.pie<{value: number}>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<{value: number}>>()
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
      .attr("fill", d => d.data.color);
    
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text(d => d.data.value > 0 ? `${d.data.value}` : "")
      .style("fill", "white")
      .style("font-size", "12px");
  }, [nullCount, nonNullValues.length]);

  return (
    <div style={{
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#5c3d7a",
      width: "90%",
      maxWidth: "800px",
      marginTop: "20px"
    }}>
      <h2 style={{ 
        color: "#f9f9f9",
        borderBottom: "2px solid #4e79a7",
        paddingBottom: "10px",
        marginBottom: "20px"
      }}>
        Distribución y estadísticos de {selectedKey.replace('_', ' ')}
      </h2>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        {/* Histograma */}
        <div style={{ flex: 2, minWidth: "300px" }}>
          <h3>Frecuencia de valores</h3>
          <svg ref={histogramRef}></svg>
        </div>

        
        
        {/* Gráfico de pastel para nulos 
        <div style={{ flex: 1, minWidth: "200px" }}>
          <h3>Valores nulos vs no nulos</h3>
          <svg ref={pieChartRef}></svg>
          <div style={{ marginTop: "10px" }}>
            <p>No nulos: {nonNullValues.length}</p>
            <p>Nulos: {nullCount}</p>
          </div>
        </div>
        */}
      </div>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginTop: "20px" }}>
        {/* Estadísticas */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3>Estadísticas descriptivas</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Valores no nulos:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{nonNullValues.length}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Valores únicos:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{uniqueValues}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Mínimo:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{min.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>25% (Q1):</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{q1.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>50% (Mediana):</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{median.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Promedio:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{mean.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Promedio ponderado:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{weightedAvg.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>75% (Q3):</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{q3.toFixed(6)}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}><strong>Máximo:</strong></td>
                <td style={{ padding: "5px", borderBottom: "1px solid #eee" }}>{max.toFixed(6)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Distribución por GEOID */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3>Distribución por región (GEOID)</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>GEOID</th>
                  <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {values.slice(0, 10).map((val, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{geoids[index]}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                      {isNaN(val) ? "N/A" : val.toFixed(6)}
                    </td>
                  </tr>
                ))}
                {values.length > 10 && (
                  <tr>
                    <td colSpan={2} style={{ padding: "8px", textAlign: "center", fontStyle: "italic" }}>
                      y {values.length - 10} regiones más...
                    </td>
                  </tr>
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

/* esto esta re perfecto*/