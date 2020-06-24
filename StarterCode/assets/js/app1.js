var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) - 2,
    d3.max(censusData, d => d[chosenXAxis]) + 2])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  console.log(circlesGroup);
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    
  return circlesGroup;
}


    
    

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chartGroup, circlesGroup) {
console.log(circlesGroup);
  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty:";
  }
  else {
    label = "Age:";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      return (label );
    });
  

    //${d.state}<br>${d[chosenXAxis]}
    circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide)

  return circlesGroup;
}

// function updateText(circlesGroup, newXScale, chosenXAxis) {

//   circlesGroup.append("text")
//     circlesGroup.transition()
//       .duration(1000)
//       .attr("x", d => newXScale(d[chosenXAxis]))

//   return circlesGroup;
// }

// Import Data
d3.csv("assets/data/data.csv").then(function (censusData, err) {
  if (err) throw err;

  // Step 1: Parse Data/Cast as numbers
  // ==============================
  censusData.forEach(function (data) {
    data.age = +data.age;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = xScale(censusData, chosenXAxis);

  var yLinearScale = d3.scaleLinear()
    .domain([2, d3.max(censusData, d => d.healthcare) + 2])
    .range([height, 0]);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Append Axes to the chart
  // ==============================
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);


  // Step 5: Create Circles
  // ==============================
  // censusData.forEach(d => console.log(d));

  var circlesGroup = chartGroup.append("g")
                        .classed("circles-group",true)

  circlesGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5")
    .on ("mouseover",toolTip.show)
    .on ("mouseout",toolTip.hide);



  var textGroup = chartGroup.append("g")
                         .classed("textAbbr-group",true);

  textGroup.selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.healthcare) + 4)
    .text(function (d) { return d.abbr })
    .attr("class", "aText")

    //circlesGroup = updateToolTip(chosenXAxis, chartGroup,circlesGroup);

  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age ( Median) ");

   

  




  // Create axes labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (Percent)");

  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        

        // updates tooltips with new info
        //circlesGroup = updateToolTip(chosenXAxis, chartGroup,circlesGroup);


        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function (error) {
  console.log(error);
});
