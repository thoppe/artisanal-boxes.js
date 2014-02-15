var eq = {
    A:null,
    b:null,
    N:null,
    sol:null,
    eqn_idx:null
};

function solve_all_artboxes(suppress_ready) {
    $(".artbox").each(solve_artbox);

    // Fire off an event when the artbox is solved for other libaries
    if(suppress_ready != true) {
        $(this).ready("ready", null);
    };
};

$(document).ready(function() {
    // Run this once on document load, do not fire ready yet
    solve_all_artboxes(true);
}); 

$(window).on("load", function() { 
    solve_all_artboxes();
});

$(window).resize( solve_all_artboxes );


function solve_artbox() {

    // Remove any previous set widths or heights
    $(this).css({"height":"","width":""});

    // Label the selectors
    var nodes  = $(".node", this);
    var boxes  = $(".hbox, .vbox", this)
    var all_items = $(".node, .vbox, .hbox", this);

    // Assign a matrix index to each item
    all_items.each(index_items);

    // Loop through all the nodes and measure the aspect
    nodes.each(measure_aspect);

    // Reserve space for the matrix equations
    eq.N = 2*all_items.length;
    eq.A = numeric.rep([eq.N,eq.N],0);
    eq.b = numeric.rep([eq.N],0);
    eq.eqn_idx = 0;

    // Loop over the nodes, assign matrix equations
    nodes.each(assign_node_equation);

    // Loop over the boxes, assign matrix equations
    boxes.each(assign_box_equations);

    // Set the final width (for now, no final height)
    set_final_width($(this));
    
    // Solve the matrix equations
    eq.sol = numeric.solve(eq.A,eq.b);

    // Scale all the nodes
    nodes.each(scale_nodes_to_size);

    // Set the dimensions for the boxes
    // Using the updated width/height now set the boxes aspect
    boxes.each(set_dimensions);

    // Set the first box to (0,0) position
    boxes.first().css({left:0,top:0});
    boxes.each(set_positions);

    // Set the width, height on the artbox so other elements can
    // flow around it properly
    $(this).css({"height":get_y_sol(0),
                 "width" :get_x_sol(0)});

    // DEBUG: output
    //all_items.each(function() {console.log($(this).data())});
};


function print(a) { console.log(numeric.prettyPrint(a)); };

/* *********************************************************** */
function scale_nodes_to_size() {
    var idx   = $(this).data("index");
    var scale = get_x_sol(idx)/$(this).innerWidth();
    transform_scale($(this), scale);
};

/* *********************************************************** */
function set_positions() {
    var kids  = $(this).children(".node, .vbox, .hbox");
    var delta = 0;

    if ($(this).hasClass("vbox")) {
	      kids.each(function() { 
	          $(this).css({left:0,top:delta});
	          delta += get_y_sol($(this).data("index"));
	      });
    }

    else if ($(this).hasClass("hbox")) {
	      kids.each(function() { 
	          $(this).css({left:delta,top:0});
	          delta += get_x_sol( $(this).data("index") );
	      });
    };
};

/* *********************************************************** */

function set_dimensions() {
    var idx = $(this).data("index");
    $(this).width ( get_x_sol(idx) );
    $(this).height( get_y_sol(idx) );
};

/* *********************************************************** */
// Helper functions
/* *********************************************************** */

function set_x_equation(idx, val) {
    eq.A[eq.eqn_idx][idx] = val;
}
function set_y_equation(idx, val) {
    eq.A[eq.eqn_idx][eq.N/2+idx] = val;
};

function get_y_sol(idx) {
    return eq.sol[eq.N/2+idx];
};

function get_x_sol(idx) {
    return eq.sol[idx];
};

/* *********************************************************** */
function set_final_width(ele) {
    set_x_equation(0,1);
    eq.b[eq.eqn_idx] = ele.innerWidth();
    eq.eqn_idx += 1;
};

function set_final_height(ele) {
    set_y_equation(0,1);
    eq.b[eq.eqn_idx] = ele.innerHeight();
    eq.eqn_idx += 1;
};

/* *********************************************************** */
function assign_box_equations() {

    // Determine if we are vertical or horzontial
    var f1, f2;
    if($(this).hasClass("vbox")) {
	      f1 = set_y_equation;
	      f2 = set_x_equation;
    }
    else if($(this).hasClass("hbox")) {
	      f1 = set_x_equation;
	      f2 = set_y_equation;
    };

    var self_idx = $(this).data("index");
    var kids     = $(this).children(".node, .vbox, .hbox");

    // Sum along growth direction equals parent
    kids.each(function() {
	      var kid_idx = $(this).data("index");
	      f1(kid_idx, 1);
    });

    f1(self_idx, -1);
    eq.eqn_idx += 1;

    // Each of the childrens dimension must match the parent
    kids.each(function() {
	      var kid_idx = $(this).data("index");
	      f2(kid_idx ,  1);
	      f2(self_idx, -1);
	      eq.eqn_idx += 1;
    });
};

function assign_node_equation() {
    // Set constraint [(width)/(height) = aspect ratio]
    var idx = $(this).data("index");
    var aspect = $(this).data("aspect");
    set_x_equation(idx,1);
    set_y_equation(idx,-aspect);
    eq.eqn_idx += 1;
};

/* *********************************************************** */

function index_items(idx,ele) {
    $(this).data("index",idx);
};

function measure_aspect() {
    ele = $(this);
    var aspect = ele.innerWidth()/ele.innerHeight();
    ele.data("aspect",aspect);
};

/* Cross browser CSS3 functions */                 

function transform_origin(ele, x_pct, y_pct) {
    var coords = x_pct + "% " + y_pct + "%";
    ele.css("transform-origin",coords);
    ele.css("-webkit-transform-origin",coords);
    ele.css("-ms-transform-origin",coords);
    ele.css("-o-transform-origin",coords);
}

function transform_scale(ele, scale) {
    var coords = 'scale('+scale+')';
    ele.css({"-webkit-transform":coords});
    ele.css({"-ms-transform":coords});
    ele.css({"-o-transform":coords});
    ele.css({"transform":coords});
}



