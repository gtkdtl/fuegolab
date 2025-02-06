
var lastClickedMarker = null;

function buildGeojsonLayer(featureCollection) {
    return L.geoJSON(featureCollection, {
        pointToLayer: function(feature, latlng) {
            let superficie = feature.properties.Superficie || 1;
            let radius = scaleLog(superficie, 1, 10000, 2, 8);
            let color = getColor(superficie);
            return L.circleMarker(latlng, {
                radius: radius,
                fillColor: color,
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.on('click', function() {
                if (lastClickedMarker) {
                    lastClickedMarker.setStyle({ color: 'black', weight: 1 });
                }
                this.setStyle({ color: 'white', weight: 2 });
                lastClickedMarker = this;
                updateInfoTable(feature.properties);
            });
        }
    });
}

function loadGeoJSON(filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo: ${filePath}`);
            }
            return response.json();
        })
        .then(data => {
            window.currentGeojsonData = data;
            if (geojsonLayer) {
                map.removeLayer(geojsonLayer);
            }
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }

            heatmapData = data.features
                .filter(feature => feature.properties.Superficie > 100)
                .map(feature => {
                    const lat = feature.geometry.coordinates[1];
                    const lng = feature.geometry.coordinates[0];
                    const intensidad = feature.properties.Superficie;
                    return [lat, lng, intensidad];
                });

            heatmapLayer = L.heatLayer(heatmapData, {
                radius: 20,
                blur: 20,
                maxZoom: 80,
                max: 1,
                gradient: {
                    0.2: "#99CCFF",
                    0.4: "#3399FF",
                    0.6: "#0044CC",
                    0.8: "#002266",
                    1.0: "#000033"
                }
            });

            if (document.getElementById('toggle-heatmap').dataset.active === "true") {
                map.addLayer(heatmapLayer);
            }

            geojsonLayer = buildGeojsonLayer(data).addTo(map);
            if (geojsonLayer.getBounds().isValid()) {
                var center = geojsonLayer.getBounds().getCenter();
                map.setView(center, 6);
            }
            let superficies = data.features.map(feature => feature.properties.Superficie);
            let minSuperficie = Math.min(...superficies);
            let maxSuperficie = Math.max(...superficies);

            let filterMin = document.getElementById('filter-min');
            let filterMax = document.getElementById('filter-max');
            let filterMinValue = document.getElementById('filter-min-value');
            let filterMaxValue = document.getElementById('filter-max-value');

            if (filterMin && filterMax && filterMinValue && filterMaxValue) {
                filterMin.min = minSuperficie;
                filterMin.max = maxSuperficie;
                filterMin.value = minSuperficie;
                filterMinValue.textContent = minSuperficie;

                filterMax.min = minSuperficie;
                filterMax.max = maxSuperficie;
                filterMax.value = maxSuperficie;
                filterMaxValue.textContent = maxSuperficie;
            }
            document.getElementById('toggle-heatmap').disabled = false;
        })
        .catch(error => console.error("Error al cargar GeoJSON:", error));
}

document.getElementById('toggle-heatmap').addEventListener('click', function () {
    if (heatmapLayer) {
        if (map.hasLayer(heatmapLayer)) {
            map.removeLayer(heatmapLayer);
            this.textContent = "Activar Mapa de Calor";
            this.dataset.active = "false";
        } else {
            map.addLayer(heatmapLayer);
            this.textContent = "Desactivar Mapa de Calor";
            this.dataset.active = "true";
        }
    }
});

function applyRangeFilter(minValue, maxValue) {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }
    if (map.hasLayer(heatmapLayer)) {
        map.removeLayer(heatmapLayer);
        let toggleBtn = document.getElementById('toggle-heatmap');
        toggleBtn.textContent = "Activar Mapa de Calor";
        toggleBtn.dataset.active = "false";
        toggleBtn.disabled = true;
    }
    let filteredFeatures = window.currentGeojsonData.features.filter(feature => {
        let s = feature.properties.Superficie;
        return s >= minValue && s <= maxValue;
    });
    let filteredData = Object.assign({}, window.currentGeojsonData, { features: filteredFeatures });
    geojsonLayer = buildGeojsonLayer(filteredData).addTo(map);
    if (geojsonLayer.getBounds().isValid()) {
        let center = geojsonLayer.getBounds().getCenter();
        map.setView(center, 6);
    }
}

function cancelFilter() {
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
    }
    geojsonLayer = buildGeojsonLayer(window.currentGeojsonData).addTo(map);
    if (geojsonLayer.getBounds().isValid()) {
        let center = geojsonLayer.getBounds().getCenter();
        map.setView(center, 6);
    }
    document.getElementById('toggle-heatmap').disabled = false;
}

document.getElementById('filter-min').addEventListener('input', function(){
    let value = this.value;
    document.getElementById('filter-min-value').textContent = value;
    let filterMax = document.getElementById('filter-max');
    if (parseFloat(value) > parseFloat(filterMax.value)) {
        filterMax.value = value;
        document.getElementById('filter-max-value').textContent = value;
    }
});

document.getElementById('filter-max').addEventListener('input', function(){
    let value = this.value;
    document.getElementById('filter-max-value').textContent = value;
    let filterMin = document.getElementById('filter-min');
    if (parseFloat(value) < parseFloat(filterMin.value)) {
        filterMin.value = value;
        document.getElementById('filter-min-value').textContent = value;
    }
});

document.getElementById('apply-filter').addEventListener('click', function(){
    let minVal = parseFloat(document.getElementById('filter-min').value);
    let maxVal = parseFloat(document.getElementById('filter-max').value);
    applyRangeFilter(minVal, maxVal);
});

document.getElementById('cancel-filter').addEventListener('click', function(){
    cancelFilter();
});

loadGeoJSON(document.getElementById('geojson-files').value);

document.getElementById('geojson-files').addEventListener('change', function(){
    loadGeoJSON(this.value);
});
