const id_ref = "#map-life-expectancy-world"

const margin_1 = { top: 20, right: 20, bottom: 20, left: 20 },
    width_1 = 760 - margin_1.left - margin_1.right,
    height_1 = 300 - margin_1.top - margin_1.bottom;

const colorScale = d3.scaleThreshold().domain(d3.range(45, 85, 5)).range(d3.schemeBlues[8])

const svg_1 = d3.select(id_ref)
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 ' + (width_1 + margin_1.left + margin_1.right) +
        ' ' + (height_1 + margin_1.top + margin_1.bottom))
    .append("g")
    .attr("transform", `translate(${margin_1.left}, ${margin_1.top})`);

const path = d3.geoPath();
var projection = d3.geoNaturalEarth1().scale(120).center([0, 45]).translate([width_1 / 2.2, height_1 / 4])
var parseDate = d3.timeParse("%Y")

var gTime = d3.select("#slider-map-life-expectancy-world")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", '0 0 1024 100')
    .append("g")
    .attr("transform", `translate(${(1024-540)/2},${(100-(42*2))})`)

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
        function drawMap(year) {
            let map = new Map()
            
            byYear[year].forEach(el => {
                map.set(el.Id, +el.Life_expectancy_at_birth)
            });
            
            paths.attr("fill", (d) => colorScale(map.get(d.id) || 0))
        
        }
        var slider = d3.sliderBottom()
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
            let currentValue = slider.value();
            // increment the value by 1
            currentValue += 1;
            if (currentValue > 2021) {
                // if we reached the end of the slider, reset to the beginning
                isPlaying = !isPlaying;
                clearInterval(intervalId);
                playPauseBtn.textContent = 'Play';
            }
            // set the new value of the slider
            slider.value(currentValue);
        }

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                clearInterval(intervalId);
                playPauseBtn.textContent = 'Play';
            } else {
                if(slider.value() === 2021)
                    slider.value(1950);
                intervalId = setInterval(playSlider, 300);
                playPauseBtn.textContent = 'Pause';
            }
            isPlaying = !isPlaying;
        });

        gTime.call(slider)
        drawMap(1950)
    }   
)