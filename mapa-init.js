
var map = L.map('map').setView([19.4326, -99.1332], 6);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var geojsonLayer = null;
var heatmapLayer = null;
var heatmapData = [];
