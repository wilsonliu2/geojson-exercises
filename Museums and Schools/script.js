var map = L.map("map").setView([53.732562, -1.863383], 13);

var base = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Styles for museum markers
var defaultStyle = {
  radius: 8,
  fillColor: "blue",
  color: "white",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.8,
};

var highlightStyle = {
  radius: 10,
  fillColor: "red",
  color: "white",
  weight: 2,
  opacity: 1,
  fillMapSchoolsity: 1,
};

// Change museum marker style onhover
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle(highlightStyle);
}

function resetHighlight(e) {
  var layer = e.target;
  layer.setStyle(defaultStyle);
}

// Attach events and popup
function onEachMuseum(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
  });

  var popupContent =
    "<div><b>" +
    feature.properties.NAME +
    "</b></div>" +
    '<a href="' +
    feature.properties.INFORMATION +
    '" target="_blank">More Info</a>';
  layer.bindPopup(popupContent);
}

// Add museum
var museumLayer = L.geoJSON(geojsonFeature, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, defaultStyle);
  },
  onEachFeature: onEachMuseum,
}).addTo(map);

// Style and scale school markers
function getSchoolMarker(feature, latlng) {
  let pupils = parseInt(feature.properties["Number of pupils on roll"]);
  let radius = Math.max(10, pupils / 25);

  var color;
  switch (feature.properties.Phase) {
    case "Primary":
      color = "red";
      break;
    case "Secondary":
      color = "green";
      break;
    default:
      color = "purple";
      break;
  }

  return L.circleMarker(latlng, {
    radius: radius,
    fillColor: color,
    color: "black",
    weight: 1,
    fillOpacity: 0.8,
  });
}

// Attach popup content
function onEachSchool(feature, layer) {
  var popupContent =
    "<div><b>" +
    feature.properties.Establishment +
    "</b></div>" +
    "<div>" +
    feature.properties.Phase +
    "</div>" +
    "<div>" +
    feature.properties.Status +
    "</div>";
  layer.bindPopup(popupContent);
}

// Add schools and clustering
var schoolLayer = L.geoJSON(schools, {
  pointToLayer: getSchoolMarker,
  onEachFeature: onEachSchool,
});

var schoolClusters = L.markerClusterGroup();
schoolClusters.addLayer(schoolLayer);
map.addLayer(schoolClusters);

var baseMaps = {
  Base: base,
};

// Custom markers for schools.
/*
function getSchoolMarker(feature, latlng) {
    var iconUrl;
    switch (feature.properties.Status) {
        case "Academy sponsor led":
            iconUrl = 'icons/academy.svg';
            break;
        case "Community school":
            iconUrl = 'icons/community.svg';
            break;
        case "Voluntary aided school":
            iconUrl = 'icons/voluntary.svg';
            break;
        default:
            iconUrl = 'icons/default.svg';
            break;
    }

    var schoolIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 15], 
        popupAnchor: [0, -15]
    });

    return L.marker(latlng, {icon: schoolIcon});
}
*/

var overlayMaps = {
  Schools: schoolClusters,
  Museums: museumLayer,
};

L.control.layers(null, overlayMaps).addTo(map);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML +=
    '<div class="legend-item"><div class="museum"></div><span>Museum</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="primary-school"></div><span>Primary School</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="secondary-school"></div><span>Secondary School</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="other-school"></div><span>Other School</span></div>';

  div.innerHTML +=
    '<div class="legend-item"><div class="academy"></div><span>Academy</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="community"></div><span>Community</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="voluntary"></div><span>Voluntary</span></div>';
  div.innerHTML +=
    '<div class="legend-item"><div class="other-school-type"></div><span>Other School Type</span></div>';
  return div;
};

legend.addTo(map);
