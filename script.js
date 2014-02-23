"use strict";

// create svg canvas to draw map on
var svg = d3.select("div.container").append("svg")
.attr("class", "canvas");

// create group object g
var g = svg.append("g");

// define projection parameters
var projection = d3.geo.mercator()
.center([16.385, 48.215])
.scale(600000)
.rotate([0,0]);

// create path object 
var path = d3.geo.path().projection(projection);

// create div object to use for dynamic tooltip
var div = d3.select("div.container")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

//draw map
var buildings = d3.json("./data/buildings.geojson", function (error, data){
        g.append("g")
        .attr("class", "buildings")
        .selectAll ("path")
        .data(data.features)
        .enter().append("path")
        .attr ("d", path)

        var green = d3.json("./data/green_areas.geojson", function (error, data){
          g.append("g")
            .attr("class", "green")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", path)

            var water = d3.json("./data/water_areas.geojson", function (error, data){
              g.append("g")
                .attr("class", "water")
                .selectAll("path")
                .data(data.features)
                .enter().append("path")
                .attr("d", path)

                // call walk function to include walk here
                drawwalk();
            });
        });
    });

function drawwalk(){
    var walk = d3.json("data/walk.geojson", function (error, data){
        g.append("g")
        .attr("class", "walk")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        var pois = d3.json("data/POI.geojson", function (error, data){
            g.append("g")
            .attr("class", "pois")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "poi")
            .attr("d", path)
            .on("click", clicked)

            // tooltip is defined here:
            .on("mouseover", function(d) {
                div.transition()
                .duration(200)
                .style("opacity", .9);
                div.html(d.properties.title)
                .style("left", (d3.event.pageX + 28) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
                //d3.select(this).attr("stroke-width", "").style("stroke-width", 8 "px");
                // no idea why this isn't working (i would like to enlarge the poi)
            })
            .on("mouseout", function(d) {
                div.transition()
                .duration(100)
                .style("opacity", 0);
            });

            g.append("g")
            .attr("class", "label")
            .selectAll("text")
            .data(data.features)
            .enter()
            .append("text")
            .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.properties.name; })
            .style("pointer-events", "none")
            .append("title")
            .text(function(d) { return d.properties.title; })
            .style("pointer-events", "none");
        });
    });
}

// click on poi
function clicked(d) {

    div.transition()
    .duration(100)
    .style("opacity", 0);

    var x, y, k, centered;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    g.selectAll("path")
    .classed("active", centered && function(d) { 
        return d === centered; 
    });

    g.transition()
    .duration(750)
    .attr("transform","translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1.5 / k + "px");

    // write the desciption in the text container    
    var description = d3.select("div.description").selectAll("p")
    g.append("g")
    .data(data.features)
    .enter()
    .append("p")
    .text(function(d) { return d.properties.name; });
}

// zoom functionality parameters
var zoom = d3.behavior.zoom()
.translate([0, 0])
.scale(1)
.scaleExtent([1, 8])
.on("zoom", zoomed); 
    svg.call(zoom)

// Zooooooom
function zoomed() {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

    // we could adapt the style depending on zoom level, if we would like to...

    // g.select(".buildings").style("stroke-width", 1.5 / d3.event.scale + "px");
    // g.select(".walk").style("stroke-width", .5 / d3.event.scale + "px");
}
