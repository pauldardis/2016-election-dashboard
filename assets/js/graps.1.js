queue()
    .defer(d3.csv, "assets/data/election-2016.csv")
    .await(makeGraphs);



function makeGraphs(error, salesData) {
    var ndx = crossfilter(salesData);

    // region_selector(ndx);
    // constituency_selector(ndx);
    // elected_selector(ndx);
    // party_first_preference_graphs(ndx);
    // party_total_votes_graphs(ndx);
    // candidate_first_preferance_graphs(ndx);
    // candidate_total_votes_graphs(ndx);
    // candidate_graphs(ndx);
    candidate_graphs_v2(ndx);

    // show_percent_that_are_professors(ndx, "F", "#percent-of-women-professors");
    // show_percent_that_are_professors(ndx, "M", "#percent-of-men-professors");





    dc.renderAll();
}


function candidate_graphs_v2(ndx) {

    // var genderColors = d3.scale.ordinal()
    //     .domain(["F.G.", "F.F.", "Others", "S.F.", "LAB.", "G.P."])
    //     .range(["pink", "blue", "red", "yellow", "black", "purple"]);

    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Seat'));


    // var party_color = ndx.dimension(function(d) {
    //     return [d.Party_Abbreviation, d.Seat];
    // });
      console.log(group.all());

    // var partyGroup = party_color.group();

    console.log(group.all());



    dc.barChart("#candidate-graph-v2")
        .width(800)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        // .colorAccessor(function(d) {
        //     return d.key[0];
        // })
        // .colors(genderColors)
        .group(group)
        .colors(d3.scale.ordinal().range(["#e6550e", "#fd8c3d", "#3182bc", "#fd8c3d", "#fd8c3d", "#fd8c3d", "#fd8c3d"]))
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Region")
        .yAxis().ticks(10);


}









































// function show_revenue_graphs(ndx) {
//     var dim = ndx.dimension(dc.pluck('Candidate'));
//     var group = dim.group().reduceSum(dc.pluck('Total_Votes'));
//     // var group = dim.group();

//     dc.rowChart("#revenue-graph")
//         .width(600)
//         .height(2000)
//         .margins({ top: 10, right: 50, bottom: 30, left: 50 })
//         .dimension(dim)
//         .group(group);
// .transitionDuration(500)
// .x(d3.scale.ordinal())
// .xUnits(dc.units.ordinal)
// .elasticY(true)
// .xAxisLabel("Region")
// .yAxis().ticks(10);


// }


// function candidate_graphs(ndx) {
//     var dim = ndx.dimension(dc.pluck('Candidate'));
//     var group = dim.group().reduceSum(dc.pluck('Constituency_Name'));

//     dc.barChart("#candidate-graph")
//         .width(600)
//         .height(300)
//         .margins({ top: 10, right: 50, bottom: 30, left: 50 })
//         .dimension(dim)
//         .group(group)
//         .transitionDuration(500)
//         .x(d3.scale.ordinal())
//         .xUnits(dc.units.ordinal)
//         .elasticY(true)
//         .xAxisLabel("Region")
//         .yAxis().ticks(10);

// }
