var map = L.map("map").setView([37.8, -96], 4);

var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Pop density colors
function getColor(d) {
  return d > 1000
    ? "#800026"
    : d > 500
    ? "#BD0026"
    : d > 200
    ? "#E31A1C"
    : d > 100
    ? "#FC4E2A"
    : d > 50
    ? "#FD8D3C"
    : d > 20
    ? "#FEB24C"
    : d > 10
    ? "#FED976"
    : "#FFEDA0";
}

// Density style
function style(feature) {
  return {
    fillColor: getColor(feature.properties.density),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

// Highlight style for density
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Add eventlisteners to features
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

var geojson;

// Combine data
function combineData(geoData, demoData) {
  geoData.features.forEach((feature) => {
    let match = demoData.find(
      (demoFeature) => demoFeature.State === feature.properties.name
    );
    if (match) {
      Object.assign(feature.properties, match);
    }
  });
  return geoData;
}

geojson = L.geoJson(combineData(statesData, houseHoldData), {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML =
    "<h4>US Population Density and Household Data</h4>" +
    (props
      ? "<b>" +
        props.name +
        "</b><br />" +
        props.density +
        " people / mi<sup>2</sup>" +
        "<br><b>Households:</b>" +
        "<br>Female householder: " +
        props["Female householder"].toLocaleString() +
        "<br>Male householder: " +
        props["Male householder"].toLocaleString() +
        "<br>Married-couple family household: " +
        props["Married-couple family household"].toLocaleString() +
        "<br>Nonfamily household: " +
        props["Nonfamily household"].toLocaleString() +
        "<br>Total households Overall: " +
        props["Total households Overall"].toLocaleString() +
        "<br><b>Average Household Size:</b>" +
        "<br>Female householder: " +
        props["Average Household Size - Female householder"] +
        "<br>Male householder: " +
        props["Average Household Size - Male householder"] +
        "<br>Married-couple family household: " +
        props["Average Household Size - Married-couple family household"] +
        "<br>Nonfamily household: " +
        props["Average Household Size - Nonfamily household"] +
        "<br>Overall: " +
        props["Average Household Size - Overall"] +
        "<br><b>Households with one or more people under 18 years:</b>" +
        "<br>Female householder: " +
        (
          props[
            "Households with one or more people under 18 years - Female householder"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Male householder: " +
        (
          props[
            "Households with one or more people under 18 years - Male householder"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Married-couple family household: " +
        (
          props[
            "Households with one or more people under 18 years - Married-couple family household"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Nonfamily household: " +
        (
          props[
            "Households with one or more people under 18 years - Nonfamily household"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Overall: " +
        (
          props["Households with one or more people under 18 years - Overall"] *
          100
        ).toFixed(1) +
        "%" +
        "<br><b>Households with one or more people 60 years and over:</b>" +
        "<br>Female householder: " +
        (
          props[
            "Households with one or more people 60 years and over - Female householder"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Male householder: " +
        (
          props[
            "Households with one or more people 60 years and over - Male householder"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Married-couple family household: " +
        (
          props[
            "Households with one or more people 60 years and over - Married-couple family household"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Nonfamily household: " +
        (
          props[
            "Households with one or more people 60 years and over - Nonfamily household"
          ] * 100
        ).toFixed(1) +
        "%" +
        "<br>Overall: " +
        (
          props[
            "Households with one or more people 60 years and over - Overall"
          ] * 100
        ).toFixed(1) +
        "%"
      : "Hover over a state");
};

info.addTo(map);

// Legend (density only)
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
    labels = [];

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 1) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

legend.addTo(map);

var overlayMaps = {};
var houseHoldTypes = [
  "Female householder",
  "Male householder",
  "Married-couple family household",
  "Nonfamily household",
  "Total households Overall",
];

// Highlight style for household
function highlightFeatureHousehold(e) {
  var layer = e.target;
  layer.bringToFront();
  info.update(layer.feature.properties);
}

// Reset highlight for household
function resetHighlightHousehold(e) {
  info.update();
}

houseHoldTypes.forEach((type) => {
  overlayMaps[type] = L.geoJson(combineData(statesData, houseHoldData), {
    style: function (feature) {
      return {
        fillColor: getHouseholdColor(type, feature.properties[type]),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    },
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseover: highlightFeatureHousehold,
        mouseout: resetHighlightHousehold,
        click: zoomToFeature,
      });
    },
  });
});

L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// Color based on numeric value. Higher = darker, lower = lighter.
function getHouseholdColor(type, value) {
  var colors = {
    "Female householder": [
      "#FED976",
      "#FEB24C",
      "#FD8D3C",
      "#FC4E2A",
      "#E31A1C",
      "#BD0026",
      "#800026",
    ],
    "Male householder": [
      "#CFE3F6",
      "#A8CCF0",
      "#7CB3E8",
      "#5496E0",
      "#3078D9",
      "#0858C9",
      "#0541A1",
    ],
    "Married-couple family household": [
      "#C7F3C7",
      "#A3EBA3",
      "#79E079",
      "#53D453",
      "#31C431",
      "#1A8F1A",
      "#116611",
    ],
    "Nonfamily household": [
      "#FFE7CC",
      "#FFD8B2",
      "#FFC499",
      "#FFAC7F",
      "#FF9166",
      "#FF6D4D",
      "#FF4626",
    ],
    "Total households Overall": [
      "#EFD2ED",
      "#E6BCE5",
      "#DCA5DE",
      "#D08CD6",
      "#C374CF",
      "#B45AC7",
      "#A542BF",
    ],
  };
  var thresholds = [0, 100000, 500000, 1000000, 2000000, 5000000, 10000000];
  for (var i = thresholds.length - 1; i >= 0; i--) {
    if (value > thresholds[i]) {
      return colors[type][i];
    }
  }
  return colors[type][0];
}
