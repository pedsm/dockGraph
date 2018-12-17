const Docker = require('dockerode')
const docker = new Docker()

const { log, error } = console

let containers = []

function inArr(arr, item) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].Id === item.Id) {
            return true
        }
    }
    return false
}

function update() {
    docker.listContainers((err, cons) => {
        if (err) { error(err) }
        for(container of cons) {
            if(!inArr(containers, container)) {
                containers.push(container)
            }
        }
    })
    render()
}

setInterval(update, 1000);

// D3
const color = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select("svg")
const width = +svg.attr("width")
const height = +svg.attr("height")

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.Id))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX(width / 2))
    .force('y', d3.forceY(height / 2))

// var link = svg.append("g")
//     .attr("class", "links")
//     .selectAll("line")
//     .data(graph.links)
//     .enter().append("line")
//     .attr("stroke-width", d => Math.sqrt(d.value))

let node = svg.selectAll('.node')
let circles
let labels
function render() {
    // node.exit().remove()
    newNode = svg.selectAll(".node")
        .data(containers, d => d.Id)
        .enter().append('g')
        .attr('class', 'node')

    newNode.append("circle")
        .attr("r", 5)
        .attr("fill", (d, i) => color(i))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    newNode.append("text")
        .text(d => d.Names[0])
        .attr('x', 6)
        .attr('y', 3);

    node = newNode.merge(node)
    
    simulation
        .nodes(containers)
        .on("tick", ticked);

    function ticked() {
        // link
        //     .attr("x1", function(d) { return d.source.x; })
        //     .attr("y1", function(d) { return d.source.y; })
        //     .attr("x2", function(d) { return d.target.x; })
        //     .attr("y2", function(d) { return d.target.y; });
        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

}