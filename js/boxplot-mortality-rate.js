// Refer to the id dive
const id_ref_1 = "#boxplot-mortality-rate"

// Set the dimensions and margins of the graph
const margin_1 = {top: 40, right: 20, bottom: 70, left: 70},
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

    var gTime_1 = d3.select("#slider-boxplot-mortality-rate")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", '0 0 1280 80')
        .append("g")
        .attr("transform", `translate(${(1280-540)/2},${(120-(42*2))})`)

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
        
// Read the data and compute summary statistics for each species
d3.dsv(";", "../data/mortality_rate.csv").then(function(data) {
     
    // max data assumed for the selected measure
    max_data = data.reduce((acc, el) => Math.max(acc, el.Value), -Infinity)
    
    // X axis label
    x_label = [...new Set(d3.map(data, d => d.Continent))];
    
    // Color respect to the subgroups (tree species)
    color = d3.scaleOrdinal()
    .domain(x_label)
    //.range(["#ff595e", "#ffca3a", '#8ac926', '#1982c4', '#6a4c93', '#123456']);
    .range(["#cd001a", "#ef6a00", "#f2cd00", "#79c300", "#1961ae", "#61007d"])

    // Show the X scale
    var x = d3.scaleBand()
        .range([ 0, width_1 ])
        .domain(x_label)
        .paddingInner(1)
        .paddingOuter(.5)
    svg_1.append("g")
        .attr("transform", "translate(0," + height_1 + ")")
        .call(d3.axisBottom(x).tickSizeInner(0).tickSizeOuter(0))
        .selectAll("text")
            .attr("transform", "translate(0,10)")
            .style("text-anchor", "center")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px");

    // Y axis max value
    y_max = 5000 //(Math.ceil(max_data+(5/100*max_data))/5)*5

    // Show the Y scale
    y_1 = d3.scaleLinear()
        .domain([0, y_max])
        .range([height_1, 0])
    svg_1.append("g")
        .attr("class", "plot2-axisY")
        .call(d3.axisLeft(y_1))
        .selectAll("text")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px");

    
    // rectangle for the main box
    var boxWidth = 100;

    // Show the main vertical line
    svg_1.selectAll("vertLines")
    .data(x_label)
    .enter()
    .append("line")
        .attr("class", "iqr-line")
        .attr("x1", function(d){return(x(d))})
        .attr("x2", function(d){return(x(d))})
        .attr("y1", function(d){return(y_1(0))})
        .attr("y2", function(d){return(y_1(0))})
        .attr("stroke", "black")
        .style("width", 40);

    svg_1.selectAll("boxes")
        .data(x_label)
        .enter()
        .append("rect")
            .attr("class", "boxplot-rect")
            .attr("x", function(d){return(x(d)-boxWidth/2)})
            .attr("y", function(d){return(y_1(0))})
            .attr("height", function(d){return(0)})
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", d => color(d))
            .attr("fill-opacity", 0.5);

    // Show the median
    svg_1.selectAll("medianLines")
    .data(x_label)
    .enter()
    .append("line")
        .attr("class", "median-line")
        .attr("x1", function(d){return(x(d)-boxWidth/2) })
        .attr("x2", function(d){return(x(d)+boxWidth/2) })
        .attr("y1", function(d){return(y_1(0))})
        .attr("y2", function(d){return(y_1(0))})
        .attr("stroke", "black")
        .style("width", 80);


    // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
    //var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    //  .key(function(d) { return d.Species;})
    //  .rollup(function(d) {

    function drawBoxplot(year) {
        svg_1.selectAll(".data-point")
        .remove();

        function check_year(row) {
            return +row.Year === year
        }    

        data_year = data.filter(check_year)

        var sumstat = Array.from(d3.group(data_year, d => d.Continent))
            .map(function(d) {
                q1 = d3.quantile(d[1].map(function(g) { return g["Value"];}).sort(d3.ascending),.25)
                median = d3.quantile(d[1].map(function(g) { return g["Value"];}).sort(d3.ascending),.5)
                q3 = d3.quantile(d[1].map(function(g) { return g["Value"];}).sort(d3.ascending),.75)
                mean = d3.mean(d[1].map(function(g) { return g["Value"];}))
                interQuantileRange = q3 - q1
                //tmp_min = q1 - 1.5 * interQuantileRange
                //min = (tmp_min > 0) ? tmp_min : 0
                min = Math.max(0, q1 - 1.5 * interQuantileRange)
                //tmp_max = q3 + 1.5 * interQuantileRange
                //max = (max_data > tmp_max) ? tmp_max : max_data
                max = Math.min(max_data, q3 + 1.5 * interQuantileRange)
                return ({key: d[0], q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, mean: mean})
            });

        var outlier = [];
        for(i = 0; i < sumstat.length; ++i)
        {
            current_continent = sumstat[i].key
            current_max = sumstat[i].max
            current_min = sumstat[i].min

            for(j = 0; j < data_year.length; ++j)
            {
                if ((data_year[j].Continent === current_continent) && ((data_year[j]["Value"] < current_min) || (data_year[j]["Value"] > current_max)))
                    {
                        outlier.push(data_year[j])
                    }
            }
        }

        svg_1.selectAll(".iqr-line")
            .data(sumstat)
            .transition()
            .duration(300)
            .attr("y1", function(d){return(y_1(d.min))})
            .attr("y2", function(d){return(y_1(d.max))})

        svg_1.selectAll(".boxplot-rect")
            .data(sumstat)
            .transition()
            .duration(300)
            .attr("y", function(d){return(y_1(d.q3))})
            .attr("height", function(d){return(y_1(d.q1)-y_1(d.q3))})

        svg_1.selectAll(".median-line")
            .data(sumstat)
            .transition()
            .duration(300)
            .attr("y1", function(d){return(y_1(d.median))})
            .attr("y2", function(d){return(y_1(d.median))})
        
        // Add individual points with jitter
        var jitterWidth = 50
        svg_1.selectAll("indPoints")
            .data(outlier)
            .enter()
            .append("circle")
                .attr("class", "data-point")
                .attr("cx", function(d){return(x(d.Continent) - jitterWidth/2 + Math.random()*jitterWidth )})
                .attr("cy", function(d){return(y_1(d["Value"]))})
                .attr("r", 0)
                .style("fill", d => color(d.Continent))
                .attr("stroke", "black");

            svg_1.selectAll(".data-point")
                .transition("loading")
                .duration(100)
                .attr("cy", function(d){return(y_1(d["Value"]))})
                .attr("r", 4)
                .attr("fill-opacity", 0.5)
                .delay(100);

// Animation and filling of tooltip
svg_1.selectAll(".data-point")

    // MouseOver
    .on("mouseover", function (event, d) {
        d3.select(event.currentTarget)
            .transition("selected")
                .duration(300)
                .style("fill-opacity", 1.0);

        tooltip_1.transition("appear-box")
            .duration(300)
            .style("opacity", .9)
            // Added to control the fact that the tooltip disappear if
            // we move between near boxes (horizontally)
            .delay(1);

        tooltip_1.html("<span class='tooltiptext'>" + "<b>Continent: " + d.Continent + "</b>" + 
            "<br>" + "Year: " + d.Year + 
            "<br>" + "Value: " + d.Value + "</span>")
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

        tooltip_1.transition("disappear-box")
            .duration(300)
            .style("opacity", 0);
    });

    // Animation and filling of tooltip
svg_1.selectAll("rect")

// MouseOver
.on("mouseover", function (event, d) {

    d3.select(event.currentTarget)
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
        .delay(1);

    tooltip_1.html("<span class='tooltiptext'>" + "<b>Continent: " + d.key + "</b>" + 
        "<br>" + "Year: " + year +
        "<br>" + "Q1: " + d.q1.toFixed(2) + " - Q3: " + d.q3.toFixed(2) + 
        "<br>" + "Mean: " + d.mean.toFixed(2) + 
        "<br>" + "Median: " + d.median.toFixed(2) + "</span>")
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

    tooltip_1.transition("disappear-box")
        .duration(300)
        .style("opacity", 0);
});

    }


    var slider_1 = d3.sliderBottom()
    .min(1950)
    .max(2021)
    .width(540)
    .ticks(10)
    .tickFormat(d => d)
    .step(1)
    .on("onchange", function (val){
        year=slider_1.value()
        drawBoxplot(year)
    })

    // Get the play/pause button and set initial state
    const playPauseBtn = document.getElementById('boxplot-play-pause');
    let isPlaying = false;
    let intervalId;

    function playSlider() {
        // get the current value of the slider
        let currentValue = slider_1.value();
        // increment the value by 1
        currentValue += 1;
        if (currentValue > 2021) {
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
            if(slider_1.value() === 2021)
                slider_1.value(1950);
            intervalId = setInterval(playSlider, 400);
            playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    gTime_1.call(slider_1)
    drawBoxplot(1950)


    
    // Title
    svg_1.append("text")
        .attr("class", "plot2-title")
        .attr("x", ((width_1 - (margin_1.left - margin_1.right)) / 2))             
        .attr("y", 0 - (margin_1.top / 1.7))
        .style("class", "h2")
        .style("font-size", "18px")
        .attr("text-anchor", "middle")  
        .style("text-decoration", "underline")
        //.text(`Boxplot of height for the top-5 tree species`);
        .text(`Mortality rate in continents over years`);

    // X axis label
    svg_1.append("text")
        .attr("x", ((width_1 - 50) / 2))
        .attr("y", (height_1 + 50))
        .style("class", "h2")
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .text("Continent");

    //Y axis label
    svg_1.append("text")
        .attr("class", ".plot2-axisY")
        .attr("x", (-height_1 / 2))
        .attr("y", -55)
        .style("text-anchor", "middle")
        .style("class", "h2")
        .style("font-size", "16px")
        .attr("transform", "rotate(-90)")
        .text("Mortality rate (deaths per 100k population)");
        //.text(y_label_1[subgroups_1.indexOf(measureHeading_1)]);


});
