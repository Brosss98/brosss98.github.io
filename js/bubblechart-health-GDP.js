// Refer to the id div
const id_ref_1 = "#bubblechart-health-gdp"

// Set the dimensions and margins of the graph
const margin_1 = {top: 40, right: 60, bottom: 80, left: 60},
    width_1 = 1024 - margin_1.left - margin_1.right,
    height_1 = 768 - margin_1.top - margin_1.bottom;

// Append the svg_1 object to the page
const svg_1 = d3.select(id_ref_1)
    .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        //.attr("width", width_1 + margin_1.left + margin_1.right)
        //.attr("height", height_1 + margin_1.top + margin_1.bottom)
        .attr("viewBox", '0 0 ' + (width_1 + margin_1.left + margin_1.right) +
            ' ' + (height_1 + margin_1.top + margin_1.bottom))
    .append("g")
        .attr("transform", `translate(${margin_1.left}, ${margin_1.top})`);

var gTime_1 = d3.select("#slider-bubblechart-health-gdp")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 1024 80')
    .append("g")
    .attr("transform", `translate(${(1024-540)/2},${(120-(42*2))})`)

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

// SelectBox to choose the measure to show
var selectItem_y = document.getElementById("selection-y");
var measureHeading_1 = '';
var color_1;
var continents = new Set();
var regions = new Set();
var subgroups_1;
var data_1;
var x, y, z;
var slider_1;

// Parse the Data
d3.dsv(";", '../data/health_GDP.csv').then(function(data) {

    data_1 = data

    for(i = 0; i < data.length; ++i)
        continents.add(data[i]["Continent"])
    for(i = 0; i < data.length; ++i)
        regions.add(data[i]["Region"])

    continents = Array.from(continents)
    regions = Array.from(regions)

    color_1 = d3.scaleOrdinal()
    .domain(continents)
    .range(["#cd001a", "#ef6a00", "#f2cd00", "#79c300", "#1961ae", "#61007d"])

    // Extract subgroups (possible measures)
    subgroups_1 = data.columns.slice(6, 8);

    // Load possible options for "measures" in the selectBox
    for(j = 0; j < subgroups_1.length; ++j)
    {
        opt = new Option(subgroups_1[j].replaceAll("_", " "), subgroups_1[j]);
        selectItem_y.appendChild(opt);
    };

    var min_X = d3.min(data, (d) => +d["HealthGDP"])
    min_X = min_X-(5/100*min_X)
    var max_X = d3.max(data, (d) => +d["HealthGDP"]) // il più serve a convertire le stringhe in numeri. JS ....
    max_X = Math.ceil(max_X+(5/100*max_X))

    // Show the X scale
    x = d3.scaleLog()
        .range([ 0, width_1 ])
        .domain([ min_X, max_X ])
    svg_1.append("g")
        .attr("transform", "translate(0," + height_1 + ")")
        .call(d3.axisBottom(x).tickValues([0.1, 0.2, 0.3, 1, 2, 3, 10, 20, 30]).tickFormat(d3.format(".2f")))
        .selectAll("text")
            .attr("transform", "translate(0,10)")
            .style("text-anchor", "center")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px");

    // X axis label
    svg_1.append("text")      // text label for the x axis
        .attr("x", (width_1 / 2))
        .attr("y", (height_1 + 50))
        .style("class", "h2")
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .text("Health expenditure as % of GDP");
    
    var min_Z = 1500
    var max_Z = 1500000000
    z = d3.scaleLog()
        .domain([min_Z, max_Z])
        .range([10, 40])

    function first_draw(row) {
        return +row.Year === 2000
    }

    data_first = data_1.filter(first_draw)

    svg_1.append("g")
    .selectAll(".bubble")
    .data(data_first)
    .join("circle")
        .attr("class", d => `class${continents.indexOf(d.Continent)} class-reg${regions.indexOf(d.Region)}`)
        .attr("cx", (d) => x(d.HealthGDP))
        .attr("cy", height_1)
        .attr("r", 0)
        .attr("stroke", "black")
        .attr("fill", d => color_1(d.Continent))
        .attr("fill-opacity", 0.5);

    slider_1 = d3.sliderBottom()
    .min(2000)
    .max(2019)
    .width(540)
    .ticks(3)
    .tickFormat(d => d)
    .step(1)
    .on("onchange", function (val){
        year=slider_1.value()
        drawBubble(year)
    })

    // Get the play/pause button and set initial state
    const playPauseBtn = document.getElementById('bubblechart-play-pause');
    let isPlaying = false;
    let intervalId;

    function playSlider() {
        // get the current value of the slider
        let currentValue = slider_1.value();
        // increment the value by 1
        currentValue += 1;
        if (currentValue > 2019) {
            // if we reached the end of the slider, reset to the beginning
            isPlaying = !isPlaying;
            clearInterval(intervalId);
            playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        }
        // set the new value of the slider
        slider_1.value(currentValue);
    }
    
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            clearInterval(intervalId);
            playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        } else {
            if(slider_1.value() === 2019)
                slider_1.value(2000);
            intervalId = setInterval(playSlider, 500);
            playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    gTime_1.call(slider_1)
    
    drawBubble(2000)

    // For legend
    const boxSize = 35; // Size of each box
    const boxGap = 80; // Space between each box
    const howManyAcross = 10; // 10 boxes per line 

    // legend_1
    const legend_1 = svg_1.join("g")
    .selectAll(".legend_1")
    .data(continents);
    
    legend_1.join("rect")
    .attr("x", (width_1 - margin_1.right + boxGap))
    .attr("y", function(d,i){ return 30 + (i * boxSize) + 1/5*(boxSize*howManyAcross); })
    .attr("width", boxSize - 3)
    .attr("height", boxSize - 3)
    .attr("class", d => "class"+continents.indexOf(d))
    .attr("fill", function(d){ return color_1(d); })
    .attr("fill-opacity", 0.5);
    
    legend_1.join("text")
    .attr("x", (width_1 - margin_1.right + boxGap - 10))
    .attr("y", function(d,i){ return 30 + (i * boxSize) + 1/5*(boxSize*howManyAcross); })
    .append("tspan")
    .attr("dx", 0)
    .attr("dy", boxSize/2)
    .style("fill", d => color_1(d))
    .style("alignment-baseline", "middle")
    .style("text-anchor", "end")
    .style("font-size", "14px")
    .text((d) => d)
    .attr("class", d => "class"+continents.indexOf(d))
    .attr("fill-opacity", 0.5);

    // Animation with legend
    svg_1.selectAll("rect")

    // MouseOver
    .on("mouseover", function (event, d) {

        // Select all circles
        svg_1.selectAll("circle")
            .transition("selected")
            .duration(300)
            .attr("stroke-opacity", 0)
            .attr("fill-opacity", 0.05);

        // Select all the circle with this specific class (tree species)
        idx_d = continents.indexOf(d);
        svg_1.selectAll(`.class${idx_d}`)
            .transition("selected")
            .duration(300)
            .attr("stroke-opacity", 1.0)
            .attr("fill-opacity", 1.0);
    })

    // MouseOut
    .on("mouseleave", function (event, d) {

        // Select all circles
        svg_1.selectAll("circle")
            .transition("unselected")
            .duration(300)
            .attr("stroke-opacity", 0.5)
            .attr("fill-opacity", 0.5);

        // Select all the circle with this specific class (tree species)
        idx_d = continents.indexOf(d);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("unselected")
        .duration(300)
        .attr("stroke-opacity", 0.5)
        .attr("fill-opacity", 0.5); 
    }); 

    const legend_bubble = svg_1.append("g")
        .attr("class", "legend_bubble")
        .attr("transform", "translate(" + (width_1 - margin_1.right/2) + "," + (height_1 - 150) + ")");

    const legendScale_bubble = d3.scaleLog()
        .domain([1500, 1500000000])
        .range([10, 40]);

    const legendSize_bubble = d3.scaleLog()
        .domain([1500, 1500000000])
        .range([10, 40]);

    const legendAxis_bubble = d3.axisBottom(legendScale_bubble)
      .ticks(4, ",.1s");

    const legendCircles_bubble = legend_bubble.selectAll("circle-bubble")
        .data([1500, 150000, 150000000, 1500000000])
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", (d) => -legendSize_bubble(d))
        .attr("r", (d) => legendSize_bubble(d))
        .attr("fill", "none")
        .attr("stroke", "black");

    const legendLabels_bubble = legend_bubble.selectAll("text_bubble")
        .data([1500, 150000, 150000000, 1500000000])
        .enter()
        .append("text")
        .attr("x", 50)
        .attr("y", (d, i) => -5-i*20)
        .attr("alignment-baseline", "middle")
        .text((d) => d3.format(".2s")(d))
        .style("font-family", "Fira Sans, sans-serif")
        .style("font-size", "14px");

        // legend_bubble.append("g")
        // .attr("transform", "translate(0," + (-legendSize_bubble(1500000000) - 10) + ")")
        // .call(legendAxis_bubble)
        // .select(".domain")
        // .remove();


});

function drawBubble(year) {

    svg_1.selectAll(".plot1-axisY").remove();
    svg_1.selectAll(".title1").remove();

    measureHeading_1 = selectItem_y.value;

    function check_year(row) {
        return +row.Year === year
    }

    data_year = data_1.filter(check_year)

    var min_Y = d3.min(data_1, (d) => +d[measureHeading_1])
    min_Y = Math.ceil(min_Y - (5/100*min_Y))
    var max_Y = d3.max(data_1, (d) => +d[measureHeading_1])
    max_Y = Math.ceil(max_Y + (5/100*max_Y))

    y = d3.scaleLinear()
        .domain([min_Y, max_Y])
        .range([height_1, 0])
    svg_1.append("g")
    .attr("class", "plot1-axisY")
    .call(d3.axisLeft(y))
    .selectAll("text")
        .style("text-anchor", "end")
        .style("font-family", "Fira Sans, sans-serif")
        .style("font-size", "12px");

    // Y axis label
    svg_1.append("text")
        .attr("class", "plot1-axisY")
        .attr("x", (-height_1 / 2))
        .attr("y", -40)
        .style("text-anchor", "middle")
        .style("class", "h2")
        .style("font-size", "16px")
        .attr("transform", "rotate(-90)")
        .text(function(d) {
            if (measureHeading_1 == "Life_expectancy_at_birth")
                return "Life expectancy at birth (years)"
            else
                return "Mortality rate (deaths per 100k population)"
        });

    //Title
    svg_1.append("text")
        .attr("x", ((width_1 - (margin_1.left - margin_1.right)) / 2))             
        .attr("y", 0 - (margin_1.top / 2))
        .attr("class", "title1")
        .style("class", "h2")
        .style("font-size", "18px")
        .attr("text-anchor", "middle")  
        .style("text-decoration", "underline")  
        .text(`Correlation between health expenditure (%) of GDP and ${measureHeading_1.replace("_", " ").toLowerCase()}`);
    

    data_year.forEach(el => {
        svg_1.selectAll(`.class-reg${regions.indexOf(el.Region)}`)
            .transition()
            .duration(300)
            .attr("cx", x(+el.HealthGDP))
            .attr("cy", y(+el[measureHeading_1]))
            .attr("r", z(+el.Population));
    });

    // Animation and filling of tooltip
    svg_1.selectAll("circle")

    // MouseOver
    .on("mouseover", function (event, d) {
        
        // Select all circles
        svg_1.selectAll("circle")
            .transition("selected")
            .duration(300)
            .attr("stroke-opacity", 0)
            .attr("fill-opacity", 0.05);

        // Select all the circle with this specific class (tree species)
        idx_d = continents.indexOf(d.Continent);
        svg_1.selectAll(`.class${idx_d}`)
            .transition("selected")
            .duration(300)
            .attr("stroke-opacity", 1.0)
            .attr("fill-opacity", 1.0);

        tooltip_1.style("top", (event.pageY - 10) + "px" )
        .style("left", (event.pageX + 10) + "px");

        tooltip_1.transition("appear-box")
            .duration(300)
            .style("opacity", .9)
            // Added to control the fact that the tooltip disappear if
            // we move between near boxes (horizontally)
            .delay(10);

        tooltip_1.html("<span class='tooltiptext'>" + "<b>Region: " + d.Region + "</b>" +
            "<br>" + "<b>Health expenditure (% of GDP): " + d.HealthGDP + "</b>" +
            "<br>" + `${measureHeading_1.replaceAll("_", " ")}: ` + (+d[measureHeading_1]).toFixed(2) + 
            "<br>" + "Population: " + d.Population + "</span>");
    })

    .on("mousemove", function(event, d) {
        tooltip_1
          .style("top", (event.pageY - 10) + "px" )
          .style("left", (event.pageX + 10) + "px");
    })

    // MouseOut
    .on("mouseout", function (event, d) {

        // Select all circles
        svg_1.selectAll("circle")
            .transition("unselected")
            .duration(300)
            .attr("stroke-opacity", 0.5)
            .attr("fill-opacity", 0.5);

        // Select all the circle with this specific class (tree species)
        idx_d = continents.indexOf(d.Continent);
        svg_1.selectAll(`.class${idx_d}`)
        .transition("unselected")
        .duration(300)
        .attr("stroke-opacity", 0.5)
        .attr("fill-opacity", 0.5); 

        tooltip_1.transition("disappear-box")
            .duration(300)
            .style("opacity", 0);
    });
}

function changeY() {
    year = slider_1.value()
    drawBubble(year)
}