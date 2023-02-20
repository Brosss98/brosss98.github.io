const id_ref_1 = "#map-life-expectancy-world"

const margin_1 = { top: 40, right: 20, bottom: 20, left: 20 },
    width_1 = 800 - margin_1.left - margin_1.right,
    height_1 = 360 - margin_1.top - margin_1.bottom;

const colorScale_1 = d3.scaleThreshold().domain(d3.range(45, 80, 5)).range(d3.schemeBlues[8])

const svg_1 = d3.select(id_ref_1)
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 ' + (width_1 + margin_1.left + margin_1.right) +
        ' ' + (height_1 + margin_1.top + margin_1.bottom))
    .append("g")
    //.attr("transform", `translate(${margin_1.left-20}, ${margin_1.top})`);
    .attr("transform", `translate(0, ${margin_1.top})`);

// Title
svg_1.append("text")
    .attr("x", ((width_1 + (margin_1.left + margin_1.right)) / 2))             
    .attr("y", -25)// 0 - ((height_1 - margin_1.top) / 2))
    .style("class", "h2")
    .style("font-size", "12px")
    .attr("text-anchor", "middle")  
    .style("text-decoration", "underline")  
    .text("Life expectancy in coutries over years");

const path = d3.geoPath();
var projection = d3.geoNaturalEarth1().scale(125).center([0, 50]).translate([width_1 / 2.2, height_1 / 4])
var parseDate = d3.timeParse("%Y")

var gTime_1 = d3.select("#slider-map-life-expectancy-world")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 1200 80')
    .append("g")
    .attr("transform", `translate(${(1200-540)/2},${(120-(42*2))})`)

// Add color legend
shapeWidthLegend_1 = 30;
const labels_1 = ["", "<50", "55", "60", "65", "70", "75", "80+"];
const legend_1_size = shapeWidthLegend_1*labels_1.length;

const legend_1 = d3.legendColor()
    .labels(function (d) { return labels_1[d.i]; })
    .shapePadding(0)
    .orient("vertical")
    .shapeWidth(5)
    .shapeHeight(shapeWidthLegend_1)
    .scale(colorScale_1)
    .labelAlign("start");

svg_1.append("g")
    .attr("class", "legendThreshold")
    .attr("font-family", "Fira Sans, sans-serif")
    .attr("font-size", "8px")
    .attr("transform", `translate(${(width_1 - shapeWidthLegend_1 - margin_1.right)},
                                  ${height_1 - legend_1_size - margin_1.bottom})`);

svg_1.select(".legendThreshold")
    .append("text")
        .attr("class", "caption")
        .attr("x", 7.5)//(width_1 - shapeWidthLegend_1 - margin_1.right)/2)
        .attr("y", -20)
        .style("font-family", "Fira Sans, sans-serif")
        .style("font-size", "10px")
        .attr("text-anchor", "middle")
        .text("Age");

svg_1.select(".legendThreshold")
    .call(legend_1);

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

Promise.all([
    d3.json("../data/world.geojson"),
    d3.dsv(";", "../data/life_expectancy_at_birth_full.csv")])
    .then(function (data) {
        
        let topo = data[0]
        
        byYear = groupBy(data[1], "Year")
        
        paths = svg_1.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("class", (d) => d.id)
        .style("fill-opacity", "0.9")        
        .style("stroke", "white")
        .style("stroke-width", "0.2px");
        function drawMap(year) {
            let map = new Map()
            
            byYear[year].forEach(el => {
                map.set(el.Id, +el.Life_expectancy_at_birth)
            });
            
            paths.transition()
            .duration(300)
            .attr("fill", (d) => colorScale_1(map.get(d.id) || 0))
            svg_1.selectAll("path")
            .on("mouseover", function(event, d){
                svg_1.selectAll("path")
                .style("stroke", "transparent")
                .style("fill-opacity", "0.5")
                .transition("selected")
                .duration(100);
    
                var country = d.id;
                svg_1.selectAll(`.${country}`)
                .style("stroke", "#000")
                .style("stroke-width", "1px")
                .style("fill-opacity", "1.0")
                .transition("selected")
                .duration(300);

                tooltip_1.style("top", (event.pageY - 10) + "px" )
                .style("left", (event.pageX + 10) + "px");

                        // Appear tooltip
                        tooltip_1.transition("appear-box")
                        .duration(300)
                        .style("opacity", "0.9");
                        
                        // Tooltip content
                        tooltip_1.html("<span class='tooltiptext'>" + "<b>Country: " + d.properties.name +
                        "</b><br>" + "Year: " + year + 
                        "<br>" + "Life expectancy (years): " + map.get(d.id) + "</span>");})
        }

         svg_1.selectAll("path")
        // .on("mouseover", function(event, d){


        //     // Appear tooltip
        //     // d3.select(this).attr("id", "selected");
        //     // d3.select(this).moveToFront();
        //     // tooltip.style("display", null);
        //     // drawLine(d);
        // })
        .on("mousemove", function(event, d) {
            tooltip_1
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })

        .on("mouseout", function(event, d) {
            svg_1.selectAll("path")
            .style("stroke", "white")
            .style("stroke-width", "0.2px")
            .style("fill-opacity", "0.9")
            .transition("selected")
            .duration(300);
            // tooltip.style("display", "none");
            // d3.selectAll("paths").attr("id", null);
        })

        svg_1.selectAll("g")
        // MouseLeave
        .on("mouseleave", function (event, d) {
            // Disappear tooltip
            tooltip_1.transition("disappear-box")
                .duration(300)
                .style("opacity", "0.0"); })

        var slider_1 = d3.sliderBottom()
            .min(1950)
            .max(2021)
            .width(540)
            .ticks(10)
            .tickFormat(d => d)
            .step(1)
            .on("onchange", function (val){
                drawMap(d3.timeFormat("%Y")(new Date(val, 1)))
            })

        // Get the play/pause button and set initial state
        const playPauseBtn = document.getElementById('map-play-pause');
        let isPlaying = false;
        let intervalId;

        function playSlider() {
            // get the current value of the slider
            let currentValue = slider_1.value();
            // increment the value by 1
            currentValue += 1;
            if (currentValue > 2021) {
                // if we reached the end of the slider_1, reset to the beginning
                isPlaying = !isPlaying;
                clearInterval(intervalId);
                playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            }
            // set the new value of the slider_1
            slider_1.value(currentValue);
        }

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                clearInterval(intervalId);
                playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            } else {
                if(slider_1.value() === 2021)
                    slider_1.value(1950);
                intervalId = setInterval(playSlider, 150);
                playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
            }
            isPlaying = !isPlaying;
        });

        gTime_1.call(slider_1)
        drawMap(1950)


    }   
)