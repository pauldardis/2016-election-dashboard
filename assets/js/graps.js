queue()
    .defer(d3.csv, "assets/data/election-2016.csv")
    .await(makeGraphs);



function makeGraphs(error, salesData) {
    var ndx = crossfilter(salesData);



    // these are the working graphs 
    region_selector(ndx);
    constituency_selector(ndx);
    elected_selector(ndx);
    show_count_elected_by_gender(ndx, "F", "#count-of-women-elected");
    show_count_elected_by_gender(ndx, "M", "#count-of-men-elected");
    show_count_candidate_gender(ndx, "F", "#count-of-women-elected_1");
    show_count_candidate_gender(ndx, "M", "#count-of-men-elected_1");
    party_first_preference_graphs(ndx);
    candidate_graphs(ndx);
    show_data_table(ndx) 
    








    // these are the graphs in test     

    party_total_votes_graphs(ndx);
    candidate_first_preferance_graphs(ndx);
    candidate_total_votes_graphs(ndx);
    candidate_graphs_v2(ndx);
    // candidate_people(ndx);


    dc.renderAll();
}


// This is the working section 



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

    dc.pieChart('#party_first_preference_graphs')
        .height(360)
        .width(360)
        .innerRadius(95)
        .transitionDuration(1500)
        .colors(d3.scale.ordinal().range(["#8B8C8A", "#00A3DF", "#12A853", "#014B45", "#D6323D", "#91B905"]))
        .dimension(dim)
        .renderLabel(true)
        .legend(dc.legend().x(150).y(130).itemHeight(14).gap(5))
        .title(function(d) {
            return d.key + ": " + ((d.value / d3.sum(group.all(),
                function(d) { return d.value; })) * 100).toFixed(2) + "%";
        })
        .on("pretransition", function(chart) {
            chart.selectAll("text.pie-slice").text(function(d) {
                if (dc.utils.printSingleValue(
                        (d.endAngle - d.startAngle) /
                        (2 * Math.PI) * 100) >= 6) {
                    return dc.utils.printSingleValue(
                        (d.endAngle - d.startAngle) /
                        (2 * Math.PI) * 100) + "%";
                }
            })
        })
        .group(group);
}


function candidate_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Seat'));

    dc.rowChart("#candidate-graph")
        .width(600)
        .height(400)
        .colors(d3.scale.ordinal().range(["#91B905", "#D6323D", "#014B45", "#8B8C8A", "#12A853", "#00A3DF"]))
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        .transitionDuration(1500)
        .elasticX(true)
              .ordering(function(d) { return +d.value })
        .group(group);
}



function show_count_elected_by_gender(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Result === "Elected") {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Result === "Elected") {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };
        },
    );


    dc.numberDisplay(element)
        // .formatNumber(d3.format("2.s"))
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        .transitionDuration(1500)
        .group(countThatAreElected)
}






































//this is the testing section 

function show_data_table(ndx) {

    var dim = ndx.dimension(function(d) { return d.dim; });

    var table = dc.dataTable("#dc-data-table") /* variable created for pagination */

        .dimension(dim)
        .group(function(d) { return ""; })
        .size(Infinity) /* Adjust amount of rows here. Use 'Infinity' to show all data */

        .columns([
            function(d) { return d.Constituency_Name; },
            function(d) { return d.Candidate; },
            function(d) { return d.Gender; },
            function(d) { return d.Party; },
            function(d) { return d.Party_Abbreviation_v2; },
            function(d) { return d.Result; },
            function(d) { return d.Count_1; },
            function(d) { return d.Total_Votes; }

        ]).sortBy(function(d) {
            return d.Constituency_Name; /* sortBy return = d.Constituency_Name will sort data by Constituency_Names */
        })
        .order(d3.descending) /* reinsert ; after final peice of this section */

        /* pagination */ 

        .on('preRender', update_offset)
        .on('preRedraw', update_offset)
        .on('pretransition', display);


    /* use odd pParty_Abbreviation_v2 size to show the effect better */
    var ofs = 0,
        pag = 6;

    function update_offset() {
        var totFilteredRecs = ndx.groupAll().value();
        var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
        ofs = ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / pag) * pag : ofs;
        ofs = ofs < 0 ? 0 : ofs;
        table.beginSlice(ofs); /*table used as variable for dc.dataTable("#dc-data-table") */
        table.endSlice(ofs + pag); /*table used as variable for dc.dataTable("#dc-data-table")*/
    }

    function display() {
        var totFilteredRecs = ndx.groupAll().value();
        var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
        d3.select('#begin')
            .text(end === 0 ? ofs : ofs + 1);
        d3.select('#end')
            .text(end);
        d3.select('#last')
            .attr('disabled', ofs - pag < 0 ? 'true' : null);
        d3.select('#next')
            .attr('disabled', ofs + pag >= totFilteredRecs ? 'true' : null);
        d3.select('#size').text(totFilteredRecs);
        if (totFilteredRecs != ndx.size()) {
            d3.select('#totalsize').text("(filtered Total: " + ndx.size() + " )");
        }
        else {
            d3.select('#totalsize').text('');
        }
    }

    $('#next').on('click', function() {
        ofs += pag;
        update_offset();
        table.redraw();
    });
    /* Event Listener function that fires when "next" HTML btn is clicked */  


    $('#last').on('click', function() {
        ofs -= pag;
        update_offset();
        table.redraw();
    });
    /* Event Listener function that fires when "last" HTML btn is clicked */
}















































// function candidate_people(ndx) {
//     var dim = ndx.dimension(dc.pluck('Candidate'));
//     var group = dim.group().reduceSum(dc.pluck('Count_1' ));
//     var group2 = dim.group().reduceSum(dc.pluck('Result' ));

//     console.log(dim)

//     dc.rowChart("#candidate-people")
//         .width(600)
//         .height(8600)

//         .margins({ top: 10, right: 50, bottom: 30, left: 50 })
//         .dimension(dim)
//         .transitionDuration(1500)
//         // .elasticX(true)
//         .group(group,group2);

// }













































function show_count_candidate_gender(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Result === "Excluded") {
                    p.are_excluded++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Result === "Excluded") {
                    p.are_excluded--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_excluded: 0 };
        },
    );


    dc.numberDisplay(element)
        // .formatNumber(d3.format("2.s"))
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_excluded);
            }
        })
        .transitionDuration(1500)
        .group(countThatArecandidate)
}





function candidate_graphs_v2(ndx) {

    var partyColors = d3.scale.ordinal()
        .domain(["F.G.", "F.F.", "Others", "S.F.", "LAB.", "G.P."])
        .range(["pink", "blue", "red", "yellow", "black", "green"]);

    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Seat'));


    var party_color = ndx.dimension(function(d) {
        return [d.Party_Abbreviation, d.Seat];
    });

    var partyGroup = party_color.group();

    // console.log(group.all());


    dc.barChart("#candidate-graph-v2")
        .width(1000)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        // .colorAccessor(function(d) {
        //     return d.key[0];
        // })
        .colors(d3.scale.ordinal().range(["#e6550e", "#fd8c3d", "#3182bc", "#fd8c3d", "#fd8c3d", "#fd8c3d", "#fd8c3d"]))
        .group(group)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Region")
        .yAxis().ticks(10);


}


function party_total_votes_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Seat'));

    dc.pieChart('#party_total_votes_graphs') /* targeting the div where we want the pie chart*/
        .height(360)
        .width(360)
        .innerRadius(95)
        .transitionDuration(1500)
        // .colors(d3.scale.ordinal().range(["#3182bc", "#fd8c3d", "#e6550e"]))
        .dimension(dim)
        .renderLabel(true)
        .legend(dc.legend().x(150).y(130).itemHeight(14).gap(5))
        // .radius(360)
        .group(group)
        .title();
}















// function party_total_votes_graphs(ndx) {

//     var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
//     var group = dim.group().reduceSum(dc.pluck('Total_Votes'));

//     dc.pieChart('#party_total_votes_graphs') /* targeting the div where we want the pie chart*/
//         .height(360)
//         .width(360)
//         .innerRadius(95)
//         .transitionDuration(1500)
//         // .colors(d3.scale.ordinal().range(["#3182bc", "#fd8c3d", "#e6550e"]))
//         .dimension(dim)
//         .renderLabel(true)
//         .legend(dc.legend().x(110).y(150).itemHeight(13).gap(5))
//         // .title(function(d) {
//         //     return d.key + ": " + ((d.value / d3.sum(group.all(),
//         //         function(d) { return d.value; })) * 100).toFixed(0) + "%";
//         // })
//         .on("pretransition", function(chart) 
//         {
//             chart.selectAll("text.pie-slice").text(function(d) {
//                 if (dc.utils.printSingleValue(
//                         (d.endAngle - d.startAngle) /
//                         (2 * Math.PI) * 100) >= 6) {
//                     return dc.utils.printSingleValue(
//                         (d.endAngle - d.startAngle) /
//                         (2 * Math.PI) * 100) + "%";
//                 }
//             }
//             )
//             chart.select("svg")
//                 .attr("height", "100%")
//                 .attr("width", "100%")
//                 .attr("viewBox", "0 0 360 360");
//             chart.selectAll(".dc-legend-item text")
//                 .attr("fill", "#1D47FF")
//                 .text("")
//                 .append("tspan")
//                 .text(function(d) { return d.name; })
//                 .attr("x", 70)
//                 .attr("text-anchor", "end");
//         })
//         .group(group);
// }










function candidate_first_preferance_graphs(ndx) {
    var dim = ndx.dimension(dc.pluck('Candidate'));
    var group = dim.group().reduceSum(dc.pluck('Count_1'));


    dc.pieChart('#candidate-first-preferance-graph') /* targeting the div where we want the pie chart*/
        .height(360)
        .width(360)
        .radius(360)
        .innerRadius(95)
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
