const id_ref_1 = "#stacked-area-death-causes"

const margin_1 = { top: 50, right: 70, bottom: 110, left: 70 },
    width_1 = 1024 - margin_1.left - margin_1.right,
    height_1 = 768 - margin_1.top - margin_1.bottom,
    boxSize = 30, //Size of each box
    boxGap = 50, // Space between each box
    howManyAcross = 5; // 10 boxes per line 
// Create the SVG element that will hold your chart
const svg_1 = d3.select(id_ref_1)
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    //.attr("width", width_3 + margin_3.left + margin_3.right)
    //.attr("height", height_3 + margin_3.top + margin_3.bottom)
    .attr("viewBox", '0 0 ' + (width_1 + margin_1.left + margin_1.right) +
        ' ' + (height_1 + margin_1.top + margin_1.bottom))
    .append("g")
    .attr("transform",`translate(${margin_1.left},${margin_1.top})`);
  
var color_1 = d3.scaleOrdinal()
    .range(["#cd001a", "#79c300", "#61007d"]);

// Create a tooltip
const tooltip_1 = d3.select(id_ref_1)
    .append("div")
    .attr("class", "tooltip")
    .style("font-size", "14px")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("opacity", 0);

var causes;
var continents = new Set();
var selectItem = document.getElementById("selection-continent")
var groupByContinent;
var stack_1, x_1, y_1;

// Title
svg_1.append("text")
    .attr("x", ((width_1) / 2))             
    .attr("y", 0 - 30)
    .attr("class", "area-title")
    .style("class", "h2")
    .style("font-size", "18px")
    .attr("text-anchor", "middle")  
    .style("text-decoration", "underline");

d3.csv("../data/death_by_cause_percentage.csv").then( function(data){

    causes = data.columns.slice(2)
    for(i = 0; i < data.length; ++i)
        continents.add(data[i]["Continent"])

    causes = Array.from(causes)
    continents = Array.from(continents)

    color_1.domain(causes)

    continents.forEach(el => selectItem.appendChild(new Option(el, el)))

    stack_1 = d3.stack()
        .keys(causes)
        .offset(d3.stackOffsetExpand);

    groupByContinent = Array.from(d3.group(data, d => d.Continent))
    continents.forEach(el =>
        groupByContinent[continents.indexOf(el)][1] = groupByContinent[continents.indexOf(el)][1].map(({Continent, ...item}) => item))
    
    // Define the x and y scales for your chart
    x_1 = d3.scaleBand()
        .domain(data.map(function(d) { return d.Year; }))
        .range([0, width_1])
        .padding(1);
        
    y_1 = d3.scaleLinear()
        .domain([0, 1])
        .range([height_1, 0]);
        
    svg_1.append("g")
        .attr("transform", `translate(0, ${height_1})`)
        .call(d3.axisBottom(x_1))
        .selectAll("text")
            .data(d3.range(1990, 2020))
            .attr("transform", "translate(0,10)")
            .style("text-anchor", "center")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px")
            .style("color", function(d) { if(d%5 != 0) return "white" });
        
    // Add the y-axis to your chart
    svg_1.append("g")
        .call(d3.axisLeft(y_1).ticks(5, "%"))
        .selectAll("text")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px");

    drawContinent()

    // X axis label
    svg_1.append("text")
        .attr("x", ((width_1 ) / 2))
        .attr("y", (height_1 + 60))
        .style("class", "h2")
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .text("Year");

    //Y axis label
    svg_1.append("text")
        .attr("class", ".plot1-axisY")
        .attr("x", (-height_1 / 2))
        .attr("y", -50)
        .style("text-anchor", "middle")
        .style("class", "h2")
        .style("font-size", "16px")
        .attr("transform", "rotate(-90)")
        .text("Death causes (%)");

    var legend_1 = svg_1.append("g")
    .selectAll(".legend_1")
    .data(causes);

    legend_1.join("rect")
    .attr("x", function(d,i){ return ((width_1 - 441.38)/2) + (i * boxSize) + i*(boxSize*howManyAcross);})
    .attr("y", height_1 + 80)
    .attr("width", boxSize - 3)
    .attr("height", boxSize - 3)
    .attr("class", d => "class"+causes.indexOf(d))
    .attr("fill", function(d){ return color_1(d); })
    .attr("fill-opacity", 0.5);

    legend_1.join("text")
    .attr("x", function(d,i){ return ((width_1 - 441.38)/2) + ((i+1.1) * boxSize) + i*(boxSize*howManyAcross);})
    .attr("y", height_1 + 80)
    .append("tspan")
    .attr("dx", 0)
    .attr("dy", boxSize/2)
    .style("fill", d => color_1(d))
    .style("alignment-baseline", "middle")
    .style("font-size", "14px")
    .text((d) => d)
    .attr("class", d => "class"+causes.indexOf(d))
    .attr("fill-opacity", 0.5)

    // Animation and filling of tooltip_5
    svg_1.join("g")
    .selectAll("rect")
    .on("mouseover", function (event, d) {
        // Select all the rect with this specific class (tree species)
        idx_d = causes.indexOf(d);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("selected")
        .duration(300)
        .style("fill-opacity", 1.0);
    })
    .on("mouseout", function (event, d) {
        // Select all the rect with this specific class (tree species)
        idx_d = causes.indexOf(d);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("unselected")
        .duration(300)
        .style("fill-opacity", 0.5);  
    });

})

function drawContinent() {

    svg_1.selectAll(".areapath").remove()

    continent = selectItem.value

    var area = d3.area()
        .x(function(d) { return x_1(d.data.Year); })
        .y0(function(d) { return y_1(d[0]); })
        .y1(function(d) { return y_1(d[1]); })
    
    var series = stack_1(Array.from(groupByContinent[continents.indexOf(continent)][1]));

    svg_1.selectAll(".area-title")
        .text(`Distribution of death causes (%) in ${continent}`);

    // Add the stacked areas to your chart    
    svg_1.selectAll("path")
        .data(series, function(d) { return d; })
        .enter().append("path").transition().duration(300)
        .attr("fill", function(d) { return color_1(d.key); })
        .attr("fill-opacity", 0.5)
        .attr("class", d => "areapath class"+causes.indexOf(d.key))
        .attr("d", area);
        
    svg_1.selectAll("path")
    // MouseOver
    .on("mouseover", function (event, d) {

        d3.select(event.currentTarget)
            .transition("selected")
                .duration(300)
                .style("fill-opacity", 1.0);

        idx_d = causes.indexOf(d.key);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("selected")
        .duration(300)
        .style("fill-opacity", 1.0);

        tooltip_1.style("top", (event.pageY - 10) + "px" )
        .style("left", (event.pageX + 10) + "px");

        tooltip_1.transition("appear-box")
            .duration(300)
            .style("opacity", .9)
            // Added to control the fact that the tooltip disappear if
            // we move between near boxes (horizontally)
            .delay(10);

        tooltip_1.html("<span class='tooltiptext'>" + "<b>Cause: " + d.key + "</b></span>")
    })

    .on("mousemove", function(event, d) {
            tooltip_1
            .style("top", (event.pageY - 10) + "px" )
            .style("left", (event.pageX + 10) + "px");
    })

    // MouseOut
    .on("mouseout", function (event, d) {
        d3.select(event.currentTarget)
            .transition("unselected")
            .duration(300)
            .style("fill-opacity", 0.5);
        
        idx_d = causes.indexOf(d.key);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("selected")
        .duration(300)
        .style("fill-opacity", 0.5);
        
        tooltip_1.transition("disappear-box")
            .duration(300)
            .style("opacity", 0);
    });
}