function show_data_table(ndx) {

    var dim = ndx.dimension(function(d) { return d.dim; });

    var table = dc.dataTable("#dc-data-table") /* variable created for pagination */

        .dimension(dim)
        .group(function(d) { return ""; })
        // .size(Infinity) /* Adjust amount of rows here. Use 'Infinity' to show all data */

        .columns([
            function(d) { return d.Region; },
            function(d) { return d.Constituency_Name; },
            function(d) { return d.Candidate; }
            // function(d) { return d.Activity; },
            // function(d) { return d.Sex; },
            // function(d) { return d.Age; },
            // function(d) { return d.Fatal; },
            // function(d) { return d.Species; }

        ]).sortBy(function(d) {
            return d.Region; /* sortBy return = d.Year will sort data by years */
        })
        .order(d3.descending) /* reinsert ; after final peice of this section */

        /* pagination */ 

        .on('preRender', update_offset)
        .on('preRedraw', update_offset)
        .on('pretransition', display);


    /* use odd page size to show the effect better */
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
    /* Event Listener function that fires when "next" HTML btn is clicked */  


    $('#last').on('click', function() {
        ofs -= pag;
        update_offset();
        table.redraw();
    });
    /* Event Listener function that fires when "last" HTML btn is clicked */

}