queue()
    .defer(d3.csv, "assets/data/election-2016.csv")
    .await(makeGraphs);

function makeGraphs(error, electionData) {
    var ndx = crossfilter(electionData);


    // these are the working graphs 
    region_selector(ndx);
    constituency_selector(ndx);
    party_first_preference_graphs(ndx);
    candidate_graphs(ndx);
    show_data_table(ndx);
    show_count_candidate_fg(ndx, "F", "#count-of-women-candidate-fg");
    show_count_candidate_fg(ndx, "M", "#count-of-men-candidate-fg");
    show_count_elected_fg(ndx, "F", "#count-of-women-elected-fg");
    show_count_elected_fg(ndx, "M", "#count-of-men-elected-fg");
    show_count_candidate_ff(ndx, "F", "#count-of-women-candidate-ff");
    show_count_candidate_ff(ndx, "M", "#count-of-men-candidate-ff");
    show_count_elected_ff(ndx, "F", "#count-of-women-elected-ff");
    show_count_elected_ff(ndx, "M", "#count-of-men-elected-ff");
    show_count_candidate_gp(ndx, "F", "#count-of-women-candidate-gp");
    show_count_candidate_gp(ndx, "M", "#count-of-men-candidate-gp");
    show_count_elected_gp(ndx, "F", "#count-of-women-elected-gp");
    show_count_elected_gp(ndx, "M", "#count-of-men-elected-gp");
    show_count_candidate_lab(ndx, "F", "#count-of-women-candidate-lab");
    show_count_candidate_lab(ndx, "M", "#count-of-men-candidate-lab");
    show_count_elected_lab(ndx, "F", "#count-of-women-elected-lab");
    show_count_elected_lab(ndx, "M", "#count-of-men-elected-lab");
    show_count_candidate_sf(ndx, "F", "#count-of-women-candidate-sf");
    show_count_candidate_sf(ndx, "M", "#count-of-men-candidate-sf");
    show_count_elected_sf(ndx, "F", "#count-of-women-elected-sf");
    show_count_elected_sf(ndx, "M", "#count-of-men-elected-sf");
    show_count_candidate_others(ndx, "F", "#count-of-women-candidate-others");
    show_count_candidate_others(ndx, "M", "#count-of-men-candidate-others");
    show_count_elected_others(ndx, "F", "#count-of-women-elected-others");
    show_count_elected_others(ndx, "M", "#count-of-men-elected-others");


    dc.renderAll();
}

queue()
    .defer(d3.csv, "assets/data/generalelection2016constituencydetails.csv")
    .await(makeTable);

function makeTable(error, tableData) {
    var ndx = crossfilter(tableData);


    // these are the working graphs 
    show_constituency_table(ndx)

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
        .group(group)
        .title(function(d) {
            return d.key;
        });
}

function constituency_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('Constituency_Name'));
    group = dim.group();

    dc.selectMenu("#constituency-selector")
        .dimension(dim)
        .group(group)
        .title(function(d) {
            return d.key;
        });
}

function party_first_preference_graphs(ndx) {

    var dim = ndx.dimension(dc.pluck('Party_Abbreviation'));
    var group = dim.group().reduceSum(dc.pluck('Count_1'));

    dc.pieChart('#party_first_preference_graphs')
        .height(400)
        .width(400)
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
        .width(500)
        .height(400)
        .colors(d3.scale.ordinal().range(["#91B905", "#D6323D", "#014B45", "#8B8C8A", "#12A853", "#00A3DF"]))
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        .transitionDuration(1500)
        .elasticX(true)
        .ordering(function(d) { return +d.value })
        .group(group);
}

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
            // function(d) { return d.Party_Abbreviation; },
            function(d) { return d.Result; },
            function(d) { return d.Count_1; },
            function(d) { return d.Total_Votes; }

        ]).sortBy(function(d) {
            return d.Constituency_Name; /* sortBy return = d.Constituency_Name will sort data by Constituency_Names */
        })
        .order(d3.ascending)

        /* pagination */

        .on('preRender', update_offset)
        .on('preRedraw', update_offset)
        .on('pretransition', display);



    var ofs = 0,
        pag = 7;

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



    $('#last').on('click', function() {
        ofs -= pag;
        update_offset();
        table.redraw();
    });

}


function show_count_candidate_fg(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "F.G.") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "F.G.") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_fg(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "F.G.") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "F.G.") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_count_candidate_ff(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "F.F.") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "F.F.") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_ff(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "F.F.") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "F.F.") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_count_candidate_gp(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "G.P.") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "G.P.") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_gp(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "G.P.") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "G.P.") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_count_candidate_lab(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "LAB.") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "LAB.") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_lab(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "LAB.") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "LAB.") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_count_candidate_sf(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "S.F.") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "S.F.") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_sf(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "S.F.") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "S.F.") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_count_candidate_others(ndx, gender, element) {
    var countThatArecandidate = ndx.groupAll().reduce(
        function(p, v) {
            if (v.Gender === gender) {
                p.count++;
                if (v.Party_Abbreviation === "Others") {
                    p.are_party++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.Gender === gender) {
                p.count--;
                if (v.Party_Abbreviation === "Others") {
                    p.are_party--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_party: 0 };
        },
    );

    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_party);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatArecandidate)
}

function show_count_elected_others(ndx, gender, element) {
    var countThatAreElected = ndx.groupAll().reduce(
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count++;
                if ((v.Party_Abbreviation === "Others") && (v.Result === "Elected")) {
                    p.are_elected++;
                }
            }
            return p;
        },
        function(p, v, ) {
            if (v.Gender === gender) {
                p.count--;
                if ((v.Party_Abbreviation === "Others") && (v.Result === "Elected")) {
                    p.are_elected--;
                }
            }
            return p;
        },
        function() {
            return { count: 0, are_elected: 0 };

        },
    );

    console.log(countThatAreElected);
    dc.numberDisplay(element)
        .valueAccessor(function(d) {
            if (d.count == 0) {
                return 0;
            }
            else {
                return (d.are_elected);
            }
        })
        // .transitionDuration(1500)
        .formatNumber(d3.format("1.s"))
        .group(countThatAreElected)
}

function show_constituency_table(ndx) {
    

    var dim = ndx.dimension(function(d) { return d.dim; });

    var table = dc.dataTable("#dc-constituency-table") /* variable created for pagination */
   

        .dimension(dim)
        .group(function(d) { return ""; })
        .size(Infinity) /* Adjust amount of rows here. Use 'Infinity' to show all data */

        .columns([
            function(d) { return d.Constituency_Name; },
            function(d) { return d.Total_Electorate; },
            function(d) { return ((((parseInt(d.Valid_Poll)) + (parseInt(d.Spoiled))) / (parseInt(d.Total_Electorate)) * 100).toFixed(0)) + "%" },
            function(d) { return d.Valid_Poll; },
            function(d) { return d.Spoiled; }


        ]).sortBy(function(d) {
            return d.Total_Electorate; /* sortBy return = d.Total_Electorate will sort data by Total_Electorate */
        })
        .order(d3.ascending)

}






