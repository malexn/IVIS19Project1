function bubbleChart() {
    // Constants for sizing
    var width = 940;
    var height = 600;
    var colors = ['red', 'black', 'blue'];
    // tooltip for mouseover functionality
    var tooltip = floatingTooltip('gates_tooltip', 240);
  
    // Locations to move bubbles towards, depending
    // on which view mode is selected.
    var center = { x: width / 2, y: height / 2 };
    var splitCenters = {
        1: { x: width / 3, y: height / 2 },
        2: { x: width / 2, y: height / 2 },
        3: { x: 2 * width / 3, y: height / 2 },
    };

    // @v4 strength to apply to the position forces
    var forceStrength = 0.03;
  
    // These will be set in create_nodes and create_vis
    var svg = null;
    var bubbles = null;
    var nodes = [];
  
    function charge(d) {
        return -Math.pow(d.radius, 2.0) * forceStrength;
    }

    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);
  
    simulation.stop();
  
    var fillColor = d3.scaleOrdinal()
        .domain([1,10])
        .range(['#d84b2a', '#beccae', '#7aa25c', '#afcec8','#60badb','#d82bd5',
                '#78d0ed','#759cea','#8571e8','#c370ea']);

    function createNodes(rawData) {

        var maxRadius = d3.max(rawData, function (d) { return d.InformationVisualizationSkills; });

        var radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([2, 40])
            .domain([0, maxRadius]);

        var myNodes = rawData.map(function (d) {
            return {
                id: d.id,
                radius: radiusScale(d.InformationVisualizationSkills),
                name: d.Name,
                interest: d.Interest,
                skills: {
                InformationVisualizationSkills: d.InformationVisualizationSkills,
                StatisticalSkills: d.StatisticalSkills,
                MathematicsSkills: d.MathematicsSkills,
                ArtisticSkills: d.ArtisticSkills,
                ComputerSkills: d.ComputerSkills,
                ProgrammingSkills: d.ProgrammingSkills,
                GraphicProgrammingSkills: d.GraphicProgrammingSkills,
                HCIProgrammingSkills: d.HCIProgrammingSkills,
                UXEvaluationSkills: d.UXEvaluationSkills,
                CommunicationSkills: d.CommunicationSkills,
                CoolabSkills: d.CoolabSkills,
                CodeRepositorySkills: d.CodeRepositorySkills},
                x: Math.random() * 900,
                y: Math.random() * 600
            };
        });
        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) { return b.radius - a.radius; });

        return myNodes;
    }
    
    var chart = function chart(selector, rawData) {
      // convert raw data into nodes data
      nodes = createNodes(rawData);
      // Create a SVG element inside the provided selector
      // with desired size.
      svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      // Bind nodes data to what will become DOM elements to represent them.
      bubbles = svg.selectAll('.bubble')
        .data(nodes, function (d) { return d.id; });
    
      var bubblesE = bubbles.enter().append('circle')
        .classed('bubble', true)
        .attr('r', 0)
        .attr('cx', function(d){ 
            for (var i=0; i<d.lenght;i++){
            return d[i].x;}})
        .attr('cy', function(d){ 
            for (var i=0; i<d.lenght;i++){
            return d[i].y;}})
        .attr('fill', function (d) { 
            return fillColor(d.skills.InformationVisualizationSkills); })
        .attr('stroke', function (d) { return d3.rgb(fillColor(d)).darker(); })
        .attr('stroke-width', 2)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);
    
      // @v4 Merge the original empty selection and the enter selection
      bubbles = bubbles.merge(bubblesE);
  
      // Fancy transition to make bubbles appear, ending with the
      // correct radius
      bubbles.transition()
        .duration(2000)
        .attr('r', function (d) { 

            return d.radius; });
      // Set the simulation's nodes to our newly created nodes array.
      // @v4 Once we set the nodes, the simulation will start running automatically!
      simulation.nodes(nodes);
  
      // Set initial layout to single group.
      groupBubbles();
    };
  
    function ticked() {
        bubbles
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; });
    }
    function nodeYearPos(d) {
        var num;
        for(var key in d.skills){
            num = d.skills[key]
            console.log(num)
            return num;
        }
        
        return splitCenters[num].x;
        
    }

    function groupBubbles() {
            
        // @v4 Reset the 'x' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }
    function splitBubbles() {
        // @v4 Reset the 'x' force to draw the bubbles to their year centers
        simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
    
        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
      }

    function showDetail(d) {

        d3.select(this).attr('stroke', 'black');
  
        var content = '<span class="name">Name: </span><span class="value">' +
                    d.name +
                    '</span><br/>' +
                    '<span class="name">Interest: </span><span class="value">' +
                    d.interest +
                    '</span><br/>' + 
                    '<span class="name">InformationVisualizationSkills: </span><span class="value">' +
                    
                    d.skills.InformationVisualizationSkills +
                    '</span>';
  
      tooltip.showTooltip(content, d3.event);
    }

    function hideDetail(d) {
      d3.select(this)
        .attr('stroke', d3.rgb(fillColor(d.skills)).darker());
  
      tooltip.hideTooltip();
    }

    chart.toggleDisplay = function (displayName) {
        if (displayName === 'ss') {
            splitBubbles();
        } else if (displayName === 'ivs'){
            groupBubbles();
        }
        
    };
  
    return chart;
}

var myBubbleChart = bubbleChart();

function display(error, data) {
    if (error) {
      console.log(error);
    }
    data.forEach((item, i) => {
        item.id = i ;
    });

    myBubbleChart('#vis', data);
}

function setupButtons() {
    d3.select('#toolbar')
      .selectAll('.button')
      .on('click', function () {
        // Remove active class from all buttons
        d3.selectAll('.button').classed('active', false);
        // Find the button just clicked
        var button = d3.select(this);
        button.classed('active', true);
  
        // Get the id of the button
        var buttonId = button.attr('id');
        // Toggle the bubble chart based on
        // the currently clicked button.

        myBubbleChart.toggleDisplay(buttonId);
    });
}

d3.json('IVIS19Project1.json', display);
setupButtons();