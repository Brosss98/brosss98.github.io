const id_ref_2 = "#radarchart-diseases"

// Set the dimensions and margins of the graph
const margin_2 = { top: 70, right: 20, bottom: 70, left: 20 },
    width_2 = 1024 - margin_2.left - margin_2.right,
    height_2 = 680 - margin_2.top - margin_2.bottom;
    

// Append the svg_2 object to the page
const svg_2 = d3.select(id_ref_2)
    .append("svg")
    //.attr("width", width_2 + margin_2.left + margin_2.right)
    //.attr("height", height_2 + margin_2.top + margin_2.bottom)
    .attr("viewBox", '0 0 ' + (width_2 + margin_2.left + margin_2.right) +
        ' ' + (height_2 + margin_2.top + margin_2.bottom))
    .append("g")
    .attr("transform", `translate(${margin_2.left}, ${margin_2.top})`);

    var gTime_2 = d3.select("#slider-radarchart-diseases")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 1200 80')
    .append("g")
    .attr("transform", `translate(${(1200-540)/2},${(120-(42*2))})`)

// var groupBy = function(xs, key) {
//     return xs.reduce(function(rv, x) {
//         (rv[x[key]] = rv[x[key]] || []).push(x);
//         return rv;
//     }, {});
//     };

// Title
svg_2.append("text")
.attr("x", 0)             
.attr("y", -40)
.style("class", "h2")
.style("font-size", "18px")
.attr("text-anchor", "left")  
.style("text-decoration", "underline")
.text("Death rate by disease in continents over years")
.append("tspan")
.attr("x", 0)
.attr("dy", "1.4em")
.text("(deaths per 100k population)");

// Color respect to the subgroups (tree species)
var color_2 = d3.scaleOrdinal()    //.range(["#ff595e", "#ffca3a", '#8ac926', '#1982c4', '#6a4c93', '#123456']);
.range(["#cd001a", "#ef6a00", "#f2cd00", "#79c300", "#1961ae", "#61007d"])

var continent_2 = new Set()
var disease = new Set()

d3.csv("../../data/diseases_rates.csv").then( function (data)
{
    for(i = 0; i < data.length; ++i)
        continent_2.add(data[i]['Continent'])
    for(i = 0; i < data.length; ++i)
        disease.add(data[i]['Disease']) 
    
    continent_2 = Array.from(continent_2)
    disease = Array.from(disease)

    color_2.domain(continent_2)

    var numAxis = 3
    var radius = height_2 / 2
    var angle = 2 * Math.PI / 9

    var max_value_range = 480

    var scale = d3.scaleLinear().domain([0, max_value_range]).range([0, radius])

    var axisGrid = svg_2.append('g').attr("class", "axisWrapper")

    xCoord = (l,i) => scale(l) * Math.cos(angle * i - Math.PI / 2)
    yCoord = (l,i) => scale(l) * Math.sin(angle * i - Math.PI / 2)

    axisGrid.selectAll(".levels")
    .data(d3.range(0, numAxis + 1))
    .join("circle")
    .attr("r", (d) => d / numAxis * radius)
    .attr("cx", width_2 / 2)
    .attr("cy", height_2 / 2)
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", 0.1)

    axisGrid.selectAll(".axisLabel")
    .data(d3.range(numAxis+1))
    .join("text")
    .attr("x", width_2 / 2)
    .attr("y", d => (numAxis - d) / numAxis * radius)
    .text(d => d * max_value_range/3)
    .attr("font-size", "16px")

    var axis = axisGrid.selectAll(".axis")
    .data(disease)
    .join("g")
    .attr("transform", `translate(${width_2 / 2}, ${height_2 / 2})`)
    .attr("class", "axis")
    
    axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => xCoord(max_value_range, i))
    .attr("y2", (d, i) => yCoord(max_value_range, i))
    .attr("class", "line")
    .style("stroke", "lightgrey")
    .style("stroke-width", "2px")
    
    axis.append("text")
    .attr("class", "text")
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("x", (d, i) => xCoord(max_value_range, i) * 1.15)
    .attr("y", (d, i) => yCoord(max_value_range, i) * 1.15)
    .text(d => d)
    
    function drawRadar(year) {
        function check_year(row) {
            return +row.Year === year
        }    

        data_year = data.filter(check_year)

        var byContinent = Array.from(d3.group(data_year, d => (d.Continent)))
        byContinent.forEach(el => {
            svg_2.selectAll(`.polygon-${continent_2.indexOf(el[0])}`)
            .data( [ el[1] ] )
            .attr("points", function(d){
                return d.reduce((acc, el) => acc + xCoord(el.Value, disease.indexOf(el.Disease)) + "," + yCoord(el.Value, disease.indexOf(el.Disease)) + " ", "");
            })
            .attr("stroke", (d => color_2(el[0])))
            .attr("stroke-width", "3px")
            .attr("fill", (d => color_2(el[0])))
            .attr("fill-opacity", 0.05)
        })

    }
        continent_2.forEach(el => {
            svg_2.append("g")
            .attr("transform", `translate(${width_2 / 2}, ${height_2 / 2})`)
            .append("polygon")
            .attr("class", `polygon-${continent_2.indexOf(el)} .class${continent_2.indexOf(el)}`)
            // .data( [ el[1] ] )
            // .attr("points", function(d){console.log(d);
            //     return d.reduce((acc, el) => acc + xCoord(el.Value, age.indexOf(el.Age)) + "," + yCoord(el.Value, age.indexOf(el.Age)) + " ", "");
            // })
            // .attr("stroke", (d => color_2(el[0])))
            // .attr("stroke-width", "3px")
            // .attr("fill", (d => color_2(el[0])))
            // .attr("fill-opacity", 0.05)
        })

    var slider_2 = d3.sliderBottom()
    .min(1990)
    .max(2019)
    .width(540)
    .ticks(5)
    .tickFormat(d => d)
    .step(1)
    .on("onchange", function (val){
        year=slider_2.value()
        drawRadar(year)
    })

        // Get the play/pause button and set initial state
        const playPauseBtn = document.getElementById('radarchart-play-pause');
        let isPlaying = false;
        let intervalId;
    
        function playSlider() {
            // get the current value of the slider
            let currentValue = slider_2.value();
            // increment the value by 1
            currentValue += 1;
            if (currentValue > 2019) {
                // if we reached the end of the slider, reset to the beginning
                isPlaying = !isPlaying;
                clearInterval(intervalId);
                playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            }
            // set the new value of the slider
            slider_2.value(currentValue);
        }
    
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                clearInterval(intervalId);
                playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
            } else {
                if(slider_2.value() === 2019)
                    slider_2.value(1990);
                intervalId = setInterval(playSlider, 500);
                playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
            }
            isPlaying = !isPlaying;
        });
        
    gTime_2.call(slider_2)
    drawRadar(1990)

    var legend_2 = svg_2.append("g")
    .selectAll(".legend3")
    .data(continent_2)

    legend_2.join("rect")
    .attr("x", 0)
    .attr("y", (d,i) => 15 + i * 35)
    .attr("width", 25)
    .attr("height", 25)
    .attr("fill", (d) => color_2(d))
    .attr("fill-opacity", 0.5)
    .attr("class", d => `class${continent_2.indexOf(d)}`)

    legend_2.join("text")
    .attr("x", 30)
    .attr("y", (d,i) => 15 + i * 35)
    .text(d => d)
    .attr("dy", 15)
    .style("alignment-baseline", "middle")
    .attr("font-size", "14px")
    .attr("fill", (d) => color_2(d))
    .attr("fill-opacity", 0.5)
    .attr("class", d => `class${continent_2.indexOf(d)} legend_text`)

    svg_2.selectAll("rect")
    .on("mouseover", function(event, d) {

        d3.select(event.currentTarget)
        .transition("selected")
            .duration(300)
            .style("fill-opacity", 1.0);
            
        class_of_interest = event.currentTarget.classList[0]

        svg_2.selectAll(`.${class_of_interest}`)
            .transition()
            .duration(300)
            .style("fill-opacity", 1.0);

        continent_2.forEach(el => {
            el = continent_2.indexOf(el)
        if (("class"+el) != class_of_interest) {
            svg_2.selectAll(`.polygon-${el}`)
            .transition("selected")
            .duration(300)
            .style("stroke-opacity", 0.05);
        } else {
            svg_2.selectAll(`.polygon-${el}`)
            .transition("selected")
            .duration(300)
            .style("fill-opacity", 0.75);
        }
    })
    })
    .on("mouseout", function(event, d) {
        
        d3.select(event.currentTarget)
            .transition("unselected")
            .duration(300)
            .style("fill-opacity", 0.5);

        svg_2.selectAll(`.legend_text`)
            .transition()
            .duration(300)
            .style("fill-opacity", 0.5);

        svg_2.selectAll("polygon")
            .transition("unselected")
            .duration(300)
            .style("stroke-opacity", 1.0)
            .style("fill-opacity", 0.05);

    })
})