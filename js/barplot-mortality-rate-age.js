const id_ref_3 = "#barplot-mortality-rate-age"

const boxSize_3 = 30
const legend_sep_3 = 20

// set the dimensions and margins of the graph
const margin_3 = {top: 40, right: 20, bottom: 70, left: 70},
    width_3 = 1024 - margin_3.left - margin_3.right,
    height_3 = 768 - margin_3.top - margin_3.bottom;

// append the svg object to the body of the page
const svg_3 = d3.select(id_ref_3)
  .append("svg")
  .attr("preserveAspectRatio", "xMidYMid meet")
  //.attr("width", width_3 + margin_3.left + margin_3.right)
  //.attr("height", height_3 + margin_3.top + margin_3.bottom)
  .attr("viewBox", '0 0 ' + (width_3 + margin_3.left + margin_3.right) +
      ' ' + (height_3 + margin_3.top + margin_3.bottom))
  .append("g")
    .attr("transform",`translate(${margin_3.left},${margin_3.top})`);

    var gTime_3 = d3.select("#slider-barplot-mortality-rate-age")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 1200 80')
    .append("g")
    .attr("transform", `translate(${(1200-540)/2},${(120-(42*2))})`)

    // Create a tooltip
    const tooltip_3 = d3.select(id_ref_3)
        .append("div")
        .attr("class", "tooltip")
        .style("font-size", "14px")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("opacity", 0);

var continent = new Set()
var age = new Set()

// Parse the Data
d3.dsv(";", "../data/mortality_rate_age.csv").then( function(data) {

    for(i = 0; i < data.length; ++i)
        continent.add(data[i]['Continent'])
    for(i = 0; i < data.length; ++i)
        age.add(data[i]['Age']) 
    
    continent = Array.from(continent)
    age = Array.from(age)


    // Add X axis
    const x_3 = d3.scaleBand()
        .domain(age)
        .range([0, width_3])
        .padding([0.2])
    svg_3.append("g")
        .attr("transform", `translate(0, ${height_3})`)
        .call(d3.axisBottom(x_3).tickSize(0))
        .selectAll("text")
            .attr("transform", "translate(0,10)")
            .style("text-anchor", "center")
            .style("font-family", "Fira Sans, sans-serif")
            .style("font-size", "12px");

  // Add Y axis
  const y_3 = d3.scaleLinear()
    .domain([0, 1600])
    .range([ height_3, 0 ]);
  svg_3.append("g")
    .attr("class", "plot3-axisY")
    .call(d3.axisLeft(y_3))
    .selectAll("text")
        .style("text-anchor", "end")
        .style("font-family", "Fira Sans, sans-serif")
        .style("font-size", "12px");

  // Another scale for subgroup position?
  const xSubgroup = d3.scaleBand()
    .domain(continent)
    .range([0, x_3.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  const color_3 = d3.scaleOrdinal()
    .domain(continent)
    //.range(["#ff595e", "#ffca3a", '#8ac926', '#1982c4', '#6a4c93', '#123456']);
    .range(["#cd001a", "#ef6a00", "#f2cd00", "#79c300", "#1961ae", "#61007d"])

    age.forEach(el => {
        tmp = svg_3.append("g")
        .attr("transform", `translate(${x_3(el)}, 0)`);
        continent.forEach(el2 => {
        tmp.append("rect")
        .attr("class", `rect-${age.indexOf(el)}-${continent.indexOf(el2)}`)
        .attr("class-cont", `class${continent.indexOf(el2)}`)
        .attr("x", d => xSubgroup(el2))
        .attr("width", xSubgroup.bandwidth())
        .attr("fill", d => color_3(el2))
        .attr("fill-opacity", 0.5);
})})

    function drawBar(year){
        function check_year(row) {
            return +row.Year === year
        }  

        data_year = data.filter(check_year)

        // Show the bars
        var byAgeContinent = Array.from(d3.group(data_year, d => [d.Age, d.Continent]))

        byAgeContinent.forEach(el => {
            svg_3.selectAll(`.rect-${age.indexOf(el[0][0])}-${continent.indexOf(el[0][1])}`)
            .data([el[1][0]])
            .attr("y", (d) => y_3(d.Value))
            .attr("height", function(d) { return height_3 - y_3(d.Value)})
            })
        
        svg_3.selectAll("rect")
        // MouseOver
        .on("mouseover", function (event, d) {

            d3.select(event.currentTarget)
                .transition("selected")
                    .duration(300)
                    .style("fill-opacity", 1.0);

            class_of_interest = event.currentTarget.attributes["class-cont"].value
            svg_3.selectAll(`[class-cont='${class_of_interest}'][tag='legend_3']`)
            .transition("selected")
            .duration(300)
            .style("fill-opacity", 1.0);

            tooltip_3.style("top", (event.pageY - 10) + "px" )
            .style("left", (event.pageX + 10) + "px");

            tooltip_3.transition("appear-box")
                .duration(300)
                .style("opacity", .9)
                // Added to control the fact that the tooltip disappear if
                // we move between near boxes (horizontally)
                .delay(10);

                tooltip_3.html("<span class='tooltiptext'>" + "<b>Continent: " + d.Continent + "</b>" + 
                "<br>" + "Year: " + d.Year +
                "<br>" + "Mortality rate: " + parseFloat(d.Value).toFixed() + "</span>")
        })

        .on("mousemove", function(event, d) {
                tooltip_3
                .style("top", (event.pageY - 10) + "px" )
                .style("left", (event.pageX + 10) + "px");
        })

        // MouseOut
        .on("mouseout", function (event, d) {
            d3.select(event.currentTarget)
                .transition("unselected")
                    .duration(300)
                    .style("fill-opacity", 0.5);
          
            class_of_interest = event.currentTarget.attributes["class-cont"].value
            svg_3.selectAll(`[class-cont='${class_of_interest}'][tag='legend_3']`)
            .transition("selected")
            .duration(300)
            .style("fill-opacity", 0.5);
           
            tooltip_3.transition("disappear-box")
                .duration(300)
                .style("opacity", 0);
        });
        
    }

    var slider_3 = d3.sliderBottom()
    .min(1950)
    .max(2021)
    .width(540)
    .ticks(10)
    .tickFormat(d => d)
    .step(1)
    .on("onchange", function (val){
        year=slider_3.value()
        drawBar(year)
    })

    // Get the play/pause button and set initial state
    const playPauseBtn = document.getElementById('barplot-play-pause');
    let isPlaying = false;
    let intervalId;

    function playSlider() {
        // get the current value of the slider
        let currentValue = slider_3.value();
        // increment the value by 1
        currentValue += 1;
        if (currentValue > 2021) {
            // if we reached the end of the slider, reset to the beginning
            isPlaying = !isPlaying;
            clearInterval(intervalId);
            playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        }
        // set the new value of the slider
        slider_3.value(currentValue);
    }

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            clearInterval(intervalId);
            playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        } else {
            if(slider_3.value() === 2021)
                slider_3.value(1950);
            intervalId = setInterval(playSlider, 200);
            playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    gTime_3.call(slider_3)
    drawBar(1950)
    


    // Title
    svg_3.append("text")
        .attr("class", "plot3-title")
        .attr("x", ((width_3 - (margin_3.left - margin_3.right)) / 2))             
        .attr("y", 0 - (margin_3.top / 1.7))
        .style("class", "h2")
        .style("font-size", "18px")
        .attr("text-anchor", "middle")  
        .style("text-decoration", "underline")
        //.text(`Boxplot of height for the top-5 tree species`);
        .text(`Mortality rate by age group in continents over years`);

    // X axis label
    svg_3.append("text")
        .attr("x", ((width_3 - 50) / 2))
        .attr("y", (height_3 + 50))
        .style("class", "h2")
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .text("Continent");

    //Y axis label
    svg_3.append("text")
        .attr("class", ".plot3-axisY")
        .attr("x", (-height_3 / 2))
        .attr("y", -55)
        .style("text-anchor", "middle")
        .style("class", "h2")
        .style("font-size", "16px")
        .attr("transform", "rotate(-90)")
        .text("Mortality rate (deaths per 100k population)");

    var legend_3 = svg_3.join("g")
        .selectAll("legend_3")
        .data(continent);
    
    legend_3.join("rect")
        .attr("x", width_3 - margin_3.right - margin_3.left)
        .attr("y", function(d,i){ return (50 + i * boxSize_3)})
        .attr("width", boxSize_3 - 3)
        .attr("height", boxSize_3 - 3)
        .attr("class-cont", d => "class"+continent.indexOf(d))
        .attr("fill", (d) => color_3(d))
        .attr("fill-opacity", 0.5)
        .attr("tag", "legend_3");
    
    legend_3.join("text")
        .attr("x", width_3 - 160)
        .attr("y", (d, i) => (50 + i * boxSize_3))
        .append("tspan")
        .attr("dx", 60)
        .attr("dy", boxSize_3/2 + 5)
        .text((d) => d)
        .style("fill", (d) => color_3(d))
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .attr("class-cont", d => "class"+continent.indexOf(d))
        .attr("fill-opacity", 0.5)
        .attr("tag", "legend_3");
    
    svg_3.join("g").selectAll("rect[tag='legend_3']")
    .on("mouseover", function (event, d) {
        idx = continent.indexOf(d);
        svg_3.selectAll(`[class-cont='class${idx}']`)
        .transition("selected")
        .duration(300)
        .style("fill-opacity", 1.0);
    })
    .on("mouseout", function (event, d){
        idx = continent.indexOf(d);
        svg_3.selectAll(`[class-cont='class${idx}']`)
        .transition("unselected")
        .duration(300)
        .style("fill-opacity", 0.5);
    })
    })