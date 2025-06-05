import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as dfd from "danfojs";

interface Props {
  dataFrame: dfd.DataFrame;
}

interface FeatureData {
  GEOID: string;
  LATITUDE: number;
  LONGITUDE: number;
  total_population: number;
}

interface TooltipData extends FeatureData {
  x: number;
  y: number;
}

interface GeoFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    GEOID: string;
    [key: string]: any;
  };
}

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

const Mapa: React.FC<Props> = ({ dataFrame }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<TooltipData | null>(null);
  const [clickedFeature, setClickedFeature] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeoData = async () => {
      const response = await fetch("/Boston_geo.json");
      const data: GeoFeatureCollection = await response.json();
      setGeoData(data);
    };

    fetchGeoData();
  }, []);

  useEffect(() => {
    if (geoData && svgRef.current && dataFrame) {
      d3.select(svgRef.current).selectAll("*").remove();

      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const width = 1100 - margin.left - margin.right;
      const height = 800 - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const projection = d3.geoMercator().scale(120000).center([-71.0589, 42.3601]);
      const path = d3.geoPath().projection(projection);

      const dfData = dfd.toJSON(dataFrame) as Array<Record<string, any>>;
      const featureDataMap = new Map<string, FeatureData>();

      dfData.forEach(item => {
        featureDataMap.set(item.GEOID, {
          GEOID: item.GEOID,
          LATITUDE: item.LATITUDE,
          LONGITUDE: item.LONGITUDE,
          total_population: item.total_population
        });
      });

      const getFeatureColor = (geoid: string) =>
        geoid === clickedFeature ? "red" : "lightblue";

      svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", (d: any) => path(d)!)
        .attr("fill", function (d: any) {
          return getFeatureColor(d.properties.GEOID);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function (_event, d: GeoFeature) {
          if (d.properties.GEOID !== clickedFeature) {
            d3.select(this).attr("fill", "orange");
          }

          const featureData = featureDataMap.get(d.properties.GEOID);
          if (featureData) {
            const coords = projection([featureData.LONGITUDE, featureData.LATITUDE]);
            if (!coords) return;
            const [x, y] = coords;
            setSelectedFeature({
              ...featureData,
              x: x + margin.left,
              y: y + margin.top
            });
          }
        })
        .on("mouseout", function (_event, d: GeoFeature) {
          if (d.properties.GEOID !== clickedFeature) {
            d3.select(this).attr("fill", getFeatureColor(d.properties.GEOID));
          }
          setSelectedFeature(null);
        })
        .on("click", function (_event, d: GeoFeature) {
          const clickedGEOID = d.properties.GEOID;
          setClickedFeature(clickedGEOID === clickedFeature ? null : clickedGEOID);

          const featureData = featureDataMap.get(clickedGEOID);
          if (featureData) {
            const coords = projection([featureData.LONGITUDE, featureData.LATITUDE]);
            if (!coords) return;
            const [x, y] = coords;
            setSelectedFeature({
              ...featureData,
              x: x + margin.left,
              y: y + margin.top
            });
          }

          svg.selectAll("path")
            .attr("fill", function (d: any) {
              return getFeatureColor(d.properties.GEOID);
            });
        });
    }
  }, [geoData, dataFrame, clickedFeature]);

  return (
    <div style={{
      border: '2px solid #4a90e2',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#f7f7f7',
      margin: '20px auto',
      width: '95%',
      maxWidth: '1100px',
      height: '850px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      <h4 style={{ color: '#4a90e2', textAlign: 'center', marginBottom: '20px' }}>
        {clickedFeature ? `Área seleccionada: ${clickedFeature}` : "Componente Mapa con D3.js"}
      </h4>

      {geoData ? (
        <>
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              backgroundColor: '#ffffff'
            }}
          ></svg>

          {selectedFeature && (
            <div
              ref={tooltipRef}
              style={{
                position: 'absolute',
                left: `${selectedFeature.x + 10}px`,
                top: `${selectedFeature.y + 10}px`,
                backgroundColor: 'white',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 100,
                pointerEvents: 'none',
                minWidth: '200px'
              }}
            >
              <div><strong>GEOID:</strong> {selectedFeature.GEOID}</div>
              <div><strong>Latitud:</strong> {selectedFeature.LATITUDE.toFixed(6)}</div>
              <div><strong>Longitud:</strong> {selectedFeature.LONGITUDE.toFixed(6)}</div>
              <div><strong>Población:</strong> {selectedFeature.total_population.toLocaleString()}</div>
            </div>
          )}
        </>
      ) : (
        <p>Cargando mapa...</p>
      )}
    </div>
  );
};

export default Mapa;
