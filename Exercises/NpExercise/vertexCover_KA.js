/*global define */
(function() {
  "use strict";

	var
	  jsav,           // The JSAV object
	  jsavGraph,
	  adjacencyMat,
	  tmpnodes=[],
	  gnodes=[],
	  minVC=[],
	  minSize,
	  Solution,
	  solutionShowStat;
	  //userInput;      // Boolean: Tells us if user ever did anything

	var vertexCover_KA = {

		userInput: null,
		//Solution: null
		// Initialise the exercise
		initJSAV: function (nnodes,nedges) { 	
		  vertexCover_KA.userInput = false;
		  solutionShowStat=0;

		  jsav = new JSAV("jsav");
		//  jsav.recorded();
		  
		  if (jsavGraph) {
		      jsavGraph.clear();
		  }

		  jsavGraph = jsav.ds.graph({width: 400, height: 280, layout: "automatic", directed: false});
		  graphUtils.generate(jsavGraph,{weighted:false,nodes:nnodes,edges:nedges});
		  jsavGraph.layout();

		  
		  // Bind the clickHandler to handle click events on the array
		  jsavGraph.click(clickHandler); 
		  populateAdjacencyMatrix();
		  jsav.displayInit();
		  // Set up handler for reset button

		  minSize=calcMinVC();
		  Solution = "Minimum Vertex cover is : { " + gnodes[minVC[0]].value();
		  for(var i=1;i<minVC.length;i++)
		       Solution += " , "+gnodes[minVC[i]].value();
		  Solution +=" }";
		           
		  //$("#solve").click(f_solution);
		  $("#reset").click(f_reset);
		},

		// Check user's answer for correctness: User's array must match answer
		checkAnswer: function () {
			var vcnodes=[];
			for(var i=0;i<jsavGraph.nodeCount();i++){
				if(gnodes[i].hasClass('selected'))
					vcnodes.push(i);
			}
		        if(!isVC(vcnodes) || vcnodes.length>minSize)
				return false;
			return true;
		},
		// return the solution
		getSolution: function() {
			return Solution;
		},
	}

	function isVC(vcnodes){

	    var n = jsavGraph.nodeCount();
		var adMat = new Array(n);
		for(var i=0;i<n;i++){
			adMat[i]= new Array(n);
			for(var j=0;j<n;j++)
				adMat[i][j] = adjacencyMat[i][j];
		}
	        for(var k=0; k<vcnodes.length; k++){
			i = vcnodes[k];
			for(var j=0;j<n;j++){
				adMat[i][j] = 0;
				adMat[j][i] = 0;
			}
		}
		for(var i=0;i<n;i++)
			for(var j=0;j<n;j++)
				if(adMat[i][j] == 1)
					return false;
		return true;
	}


	function getMaxOfArray(numArray) {
	    return Math.max.apply(null, numArray);
	}

	function calcMinVC(){
		var edgenum = jsavGraph.edgeCount();
	        var graphnodes=[];	
		for(var i=0;i<gnodes.length;i++){
			if(gnodes[i].neighbors().length != 0)
				graphnodes.push(gnodes[i]);
		}
	        var nodenum = graphnodes.length;
	        //var nodenum = gnodes.length;
		var subsets = new Array(2);
		var num=nodenum,tmparr,prev=0,maxnum;
		subsets[prev]= new Array(nodenum);
		for(var i=0;i<nodenum;i++){
			tmparr = new Array(1);
			tmparr[0]=i;
			if (isVC(tmparr))
	                	return 1;
			subsets[prev][i]=tmparr;
		}
		if(nodenum<edgenum)
			maxnum=nodenum;
		else
			maxnum=edgenum;
		for(var n=2; n<=maxnum ;n++){
			num = (nodenum-n+1)*num/n;		
			subsets[(prev+1)%2] = new Array(num);
			var ctr=0;
			for(var i=0;i<subsets[prev].length;i++){
				var start=getMaxOfArray(subsets[prev][i]);
				for(var j=start+1;j<nodenum;j++){
					tmparr=new Array(subsets[prev][i].length+1);
					for(var k=0;k<subsets[prev][i].length;k++)
						tmparr[k]=subsets[prev][i][k];
					tmparr[k]=j;
					if(isVC(tmparr)){
						for(var l=0;l<n;l++)
							minVC[l] = tmparr[l];
						return n;
					}
					subsets[(prev+1)%2][ctr] = tmparr;
					ctr=ctr+1;
				}
			}
			prev = (prev+1)%2;
		}

		return maxnum;
	}

		
	function populateAdjacencyMatrix(){
		gnodes = jsavGraph.nodes();
		var n = gnodes.length;
		adjacencyMat = new Array(n);
		for(var i=0;i<n;i++){
			adjacencyMat[i] = new Array(n);
			for(var j=0;j<n;j++){
				if(jsavGraph.hasEdge(gnodes[i],gnodes[j]))
					adjacencyMat[i][j]=1;
				else
					adjacencyMat[i][j]=0;
			}
		}

	}
	// Click event handler on the graph 
	var clickHandler = function () {
	    var i, edge;
	    if (!this.hasClass('selected')) {
	    	this.addClass('selected');
	    	this.highlight();
	        tmpnodes = this.neighbors();
	        for(i = 0 ; i< tmpnodes.length; i++){
			if(jsavGraph.hasEdge(this,tmpnodes[i])){
	        		edge = jsavGraph.getEdge(this,tmpnodes[i]);
				edge.css({"stroke":"#C0C0C0"});
			}
		}
	    //    jsavGraph.layout();
	    }
	    else if(this.hasClass('selected')) {
	        this.removeClass('selected');
	        this.unhighlight();
	        tmpnodes = this.neighbors();
	        for(i = 0 ; i< tmpnodes.length; i++){
			if(!tmpnodes[i].hasClass('selected') && jsavGraph.hasEdge(this,tmpnodes[i])){
	        		edge = jsavGraph.getEdge(this,tmpnodes[i]);
				edge.css({"stroke":"black"});
			}
		}
	  //      jsavGraph.layout();
	    }
	    vertexCover_KA.userInput = true;
	};

	// reset function definition
	var f_reset = function () {
	  if (jsavGraph) {
	    	var nodes = jsavGraph.nodes();
		for(var i=0;i<nodes.length;i++){
			nodes[i].unhighlight(); 
			nodes[i].removeClass('selected');
		}
		var edges = jsavGraph.edges();
		for(var i=0;i<edges.length;i++)
			edges[i].css({"stroke":"black"}); 
	  }
	  vertexCover_KA.userInput = false;
	};

	/*var f_solution = function () {
	    if(solutionShowStat==0){
		var minSize = calcMinVC();	
		for(var i=0;i<gnodes.length;i++){
			if(gnodes[i].hasClass('selected')){
				gnodes[i].removeClass('selected');
				gnodes[i].unhighlight();
			}
		}
		Edges=jsavGraph.edges();
		for(var i=0;i<Edges.length;i++)
			Edges[i].show();
		for(var i=0;i<minSize;i++){
			gnodes[minVC[i]].addClass('inSolution');
			gnodes[minVC[i]].highlight();
		}
		$("#solve").attr('value','Hide Solution');
	        solutionShowStat=1;
	    }
	    else{
		for(var i=0;i<gnodes.length;i++){
			if(gnodes[i].hasClass('inSolution')){
				gnodes[i].removeClass('inSolution');
				gnodes[i].unhighlight();
			}
		}
		$("#solve").attr('value','Show Solution');
	        solutionShowStat=0;
	    }
	};*/

	window.vertexCover_KA = window.vertexCover_KA || vertexCover_KA;

}());