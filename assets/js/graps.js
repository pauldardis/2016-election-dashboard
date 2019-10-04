queue()
    .defer(d3.csv, "assets/data/election-2016.csv")
    .await(makeGraphs);



function makeGraphs(error, salesData) {
    var ndx = crossfilter(salesData);

    region_selector(ndx);
    constituency_selector(ndx);
    elected_selector(ndx)
    party_first_preference_graphs(ndx);
    party_total_votes_graphs(ndx);
    candidate_first_preferance_graphs(ndx);
    candidate_total_votes_graphs(ndx);

    show_percent_that_are_professors(ndx, "F", "#percent-of-women-professors");
    show_percent_that_are_professors(ndx, "M", "#percent-of-men-professors"); 





    dc.renderAll();
}


function refreshPage() {
    window.location.reload();
}


function region_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('Region'));
    group = dim.group();

    dc.selectMenu("#region-selector")
        .dimension(dim)
        .group(group);
}

function constituency_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('Constituency_Name'));
    group = dim.group();

    dc.selectMenu("#constituency-selector")
        .dimension(dim)
        .group(group);
}

function elected_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('Result'));
    group = dim.group();

    dc.selectMenu("#elected-selector")
        .dimension(dim)
        .group(group);
}




function party_first_preference_graphs(ndx) {

    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Count_1'));

    dc.pieChart('#party_first_preference_graphs') /* targeting the div where we want the pie chart*/
        .height(250)
        .radius(100)
        .innerRadius(30)
        .transitionDuration(1500)
        .dimension(dim)
        .group(group);
}


function party_total_votes_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Total_Votes'));

    dc.pieChart('#party_total_votes_graphs') /* targeting the div where we want the pie chart*/
        .height(250)
        .radius(100)
        .innerRadius(30)
        .transitionDuration(1500)
        .dimension(dim)
        .group(group);
}


function candidate_first_preferance_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Candidate'));
    var group = dim.group().reduceSum(dc.pluck('Count_1'));


    dc.pieChart('#candidate-first-preferance-graph') /* targeting the div where we want the pie chart*/
        .height(250)
        .radius(100)
        .innerRadius(30)
        .transitionDuration(1500)
        .dimension(dim)
        .group(group);
}

function candidate_total_votes_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Candidate'));
    var group = dim.group().reduceSum(dc.pluck('Total_Votes'));


    dc.pieChart('#candidate-total-votes-graph') /* targeting the div where we want the pie chart*/
        .height(250)
        .radius(100)
        .innerRadius(30)
        .transitionDuration(1500)
        .dimension(dim)
        .group(group);
}












// Everything under here is in test

function show_percent_that_are_professors(ndx, gender, element) {
    var percentageThatAreProf = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if(v.Result === "Elected") {
                    p.are_prof++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if(v.Result === "Elected") {
                    p.are_prof--;
                }
            }
            return p;
        },
        function() {
            return {count: 0, are_prof: 0};    
        },
    );
    
    dc.numberDisplay(element)
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.are_prof / d.count);
            }
        })
        .group(percentageThatAreProf)
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
