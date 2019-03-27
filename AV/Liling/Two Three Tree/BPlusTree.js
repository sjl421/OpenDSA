// Helper function for tree implementation
$(document).ready(function() {
  "use strict";

  function newTree(jsav, maximum){
    return new tree(jsav, maximum);
  }

  function tree(jsav, maximum){
    this.jsav = jsav;
    this.list = []; //store array with different level inside
    this.level = 1;
    this.max = maximum;
    this.root = BPTreeNode.newNode(["", "", "", ""], jsav, maximum, true); //root will be stored as a BPTreeNode
    // if(this.root.size() == 0){
    //   this.root.hide();
    // }
    this.leafValue = []; //stored BPTreeNode for the leaf Node
    this.leafValue[0] = this.root;
    this.list[0] = this.leafValue;
    this.update = -1;
  }

  var BPTreeproto = tree.prototype;

  //following function is for graphing

  BPTreeproto.printTree = function(){
    //example: need to be deleted after
    /*var n1 = [];
    n1[0] = this.root;
    this.list[2] = n1;
    var n2 = [];
    n2[0] = this.root.child[0];
    n2[1] = this.root.child[1];
    this.list[1] = n2;
    var n3 = [];
    n3[0] = n2[0].child[0];
    n3[1] = n2[0].child[1];
    n3[2] = n2[0].child[2];
    n3[3] = n2[1].child[0];
    n3[4] = n2[1].child[1];
    this.list[0] = n3;
    this.leafValue = n3;*/
    //example end
    var nvg = 80; //node vertical gap
    //get canvas width
    var canvas = $(this.root.array.element).parent();
    var w = $(canvas).innerWidth();
    var aw = $(this.root.array.element).outerWidth() / 2; //half of the width
    var ah = $(this.root.array.element).outerHeight(); //height
    //graph leaf nodes
    var leafNodeSize = this.leafValue.length;
    var nhgl = w / (leafNodeSize + 1);
    var trackLeafIndex = 0;
    while(trackLeafIndex < this.leafValue.length){
      var hori = (trackLeafIndex + 1) * nhgl - aw;
      var vert = (this.list.length - 1) * nvg;
      this.leafValue[trackLeafIndex].move(hori, vert);
      trackLeafIndex++;
    }

    //graph parent nodes
    var tl = 1; //track list index
    while(tl < this.list.length){
      var tli = 0; //track list info index
      while(tli < this.list[tl].length){
        var cs = this.list[tl][tli].size_child; //size of children
        //front edge
        var fe = $(this.list[tl][tli].child[0].array.element).position().left;
        //back edge
        var be = $(this.list[tl][tli].child[cs - 1].array.element).position().left;
        var hori = (fe + be) / 2;
        var vert = (this.list.length - tl - 1) * nvg;
        this.list[tl][tli].move(hori, vert);
        tli++;
      }
      tl++;
    }
    this.printArrow(aw, ah);
  }

  //hw is the half of the width that the block has
  //vw is the height that the block has
  BPTreeproto.printArrow = function(hw, vw){
    var oblock = (hw * 2) / this.max; //the width of one block in one node
    var tli = this.list.length - 1; //list index, starting from the root
    while(tli > 0){
      var tci = 0; //track children's index
      while(tci < this.list[tli].length){
        var x = $(this.list[tli][tci].array.element).position().left;
        var y = $(this.list[tli][tci].array.element).position().top;
        for(var i = 0; i < this.list[tli][tci].size_child; i++){
          var x2 = $(this.list[tli][tci].child[i].array.element).position().left + hw;
          var y2 = $(this.list[tli][tci].child[i].array.element).position().top;
          var x1 = x + i * oblock;
          var y1 = y + vw;
          var a = this.jsav.g.line(x1, y1, x2, y2, { "stroke-width": 1.0});
        }
        tci++;
      }
      tli--;
    }
  }


  //Following functions are helper functions for add and delete

  /**
	 * split the current TreeNode Return the new TreeNode
	 *
	 * @param rt      the current TreeNode that will be split
	 * @param addInfo the new value that will be added in
	 * @return the new TreeNode that will be created
	 */
  BPTreeproto.split = function(rt, addInfo){
    var leftSize = Math.trunc((this.max + 1) / 2);
    var addPos = rt.insertPos(addInfo,0, this.max - 1);
    var next = BPTreeNode.newNode(["", "", "", ""], this.jsav, this.max, false);
    //add new value to the left TreeNode
    if(addPos < leftSize){
      for(var i = leftSize - 1; i < this.max; i++){
        next.insert(rt.getValue()[i]);
      }
      for(var i = this.max - 1; i >= leftSize; i--){
        rt.delete(rt.getValue()[i]);
      }
      for(var i = leftSize - 1;i > addPos; i--){
        rt.setValue(i, rt.getValue()[i - 1]);
      }
      rt.setValue(addPos, addInfo);
    }
    //add new value to the next TreeNode
    else {
			for (var i = leftSize; i < this.max; i++) {
				next.insert(rt.getValue()[i]);
			}
			next.insert(addInfo);
      for(var i = this.max - 1; i >= leftSize; i--){
        rt.delete(rt.getValue()[i]);
      }
		}
		return next;
  }

	/**
	 * add Children to the parent
  	 *
	 * @param parent    parent TreeNode
	 * @param newChild  new Child that will be added in the parent
	 * @param split     false when it does not need split, true when it does need
	 *                  split
	 * @param newParent when split is true, newParent is the TreeNode that created
	 *                  to hold other part of the value of the parent, when split is
	 *                  false, newParent is null
	 */
	BPTreeproto.addChildren = function(parent, newChild, split, newParent) {
		var pos = parent.insertChildrenPos(newChild);
		if (split) {
			var leftSize = Math.trunc((this.max + 1) / 2);
			if (pos > leftSize) {
				var j = 0;
				for (var i = leftSize + 1; i <= this.max; i++) {
          newParent.addChildrenInNodeIndex(j, parent.getChildren()[i]);
					parent.setChildren(i, null);
					j += 1;
				}
        for(var i = 0; i < j; i++){
          parent.popChild();
        }
				this.addChildren(newParent, newChild, false, null);
			} else {
				var j = 0;
				for (var i = leftSize; i <= this.max; i++) {
          newParent.addChildrenInNodeIndex(j, parent.getChildren()[i]);
					parent.setChildren(i, null);
					j += 1;
				}
        for(var i = 0; i < j; i++){
          parent.popChild();
        }
				this.addChildren(parent, newChild, false, null);
			}
		} else {
			for (var i = parent.getChildrenSize(); i > pos; i--) {
				parent.setChildren(i, parent.getChildren()[i - 1]);
			}
			parent.addChildrenInNodeIndex(pos, newChild);
		}

	}

  BPTreeproto.parentSplit = function(rt) {
    var next = BPTreeNode.newNode(["", "", "", ""], this.jsav, this.max, false);
		var leftSize = Math.trunc((this.max + 1) / 2);
		var addPos = rt.insertPos(this.update, 0, this.max - 1);
		// deal with parentNode
		if (addPos < leftSize) {
			var updateBackUp = rt.getValue()[leftSize - 1];
			for (var i = leftSize; i < this.max; i++) {
				next.insert(rt.getValue()[i]);
			}
      for(var i = this.max - 1; i >= leftSize; i--){
        rt.delete(rt.getValue()[i]);
      }
			for (var i = leftSize - 1; i > addPos; i--) {
				rt.setValue(i, rt.getValue()[i - 1]);
			}
			rt.setValue(addPos, this.update);
			this.update = updateBackUp;
		} else if (addPos > leftSize) {
			var updateBackUp = rt.getValue()[leftSize];
			for (var i = leftSize + 1; i < this.max; i++) {
				next.insert(rt.getValue()[i]);
			}
			next.insert(this.update);
      for(var i = this.max - 1; i >= leftSize; i--){
        rt.delete(rt.getValue()[i]);
      }
			this.update = updateBackUp;
		} else {
			for (var i = leftSize; i < this.max; i++) {
				next.insert(rt.getValue()[i]);
			}
      for(var i = this.max - 1; i >= leftSize; i--){
        rt.delete(rt.getValue()[i]);
      }
		}
		return next;
	}

	/**
	 * add TreeNode into the linkedList: outside insert (Leaf)
	 *
	 * @param obj the TreeNode that will be added in the Data Structure
	 */
	BPTreeproto.insertTreeNode = function(listt, obj) {
		var pos = 0;
		var b = obj.getValue()[obj.size() - 1];
		var curr = listt[pos];
		while (pos < listt.length - 1) {
			if (b <= curr.getValue()[0]) {
				break;
			} else {
				pos++;
				curr = listt[pos];
			}
		}
		if (b > curr.getValue()[0]) {
			pos++;
		}
    listt.splice(pos, 0, obj);
    //listt = this.addDataStructure(listt, pos, obj);
    return listt;
	}

	/**
	 * delete help method which check if this b plus tree has value of delInfo
	 *
	 * @param rt      root
	 * @param delInfo info that we are looking for
	 * @return true if it contains, otherwise, return false
	 */
  BPTreeproto.find = function(rt, delInfo) {
		if (rt.isLeaf()) {
			for (var i = 0; i < rt.size(); i++) {
				if (rt.getValue()[i] == delInfo) {
					return true;
				}
			}
			return false;
		} else {
			var pos = rt.findHelp(delInfo, 0, rt.size() - 1);
			return this.find(rt.getChildren()[pos], delInfo);
		}
}

 //search will be the datastructure
  BPTreeproto.getPosInList = function(search, node) {
		for (var i = 0; i < search.length; i++) {
			if (search[i] == node) {
				return i;
			}
		}
		return -1;
	}

  //rt will be the treeNode
  BPTreeproto.mergeLeaf = function(rt) {
		if (rt.size() < this.max / 2) { // need borrow or merge
			var index = this.getPosInList(this.leafValue, rt);
			// Borrow from Left
			if (index != 0 && (this.leafValue[index - 1].size() - 1) >= this.max / 2) {
				var biggestPos = this.leafValue[index - 1].size() - 1;
				var biggest = this.leafValue[index - 1].getValue()[biggestPos];
				this.leafValue[index - 1].delete(biggest);
				rt.insert(biggest);
			}
			// Borrow from Right
			else if (index != this.leafValue.length - 1
					&& (this.leafValue[index + 1].size() - 1) >= (this.max / 2)) {
				var smallest = this.leafValue[index + 1].getValue()[0];
				this.leafValue[index + 1].delete(smallest);
				rt.insert(smallest);
				return this.leafValue[index + 1];
			}
			// Merge to the Left - Deal with the Value
			else if (index != 0) {
				var prev = this.leafValue[index - 1];
				for (var i = 0; i < rt.size(); i++) {
					var del = rt.getValue()[i];
					prev.insert(del);
					rt.delete(del);
				}
			}
			// Merge to the Right - Deal with the Value
			else {
				var next = this.leafValue[index + 1];
				for (var i = 0; i < rt.size(); i++) {
					var del = rt.getValue()[i];
					next.insert(del);
					rt.delete(del);
				}
			}
		}
		return rt;
	}

	BPTreeproto.getSmallest = function(rt) {
		while (rt.getChildren()[0] != null) {
			rt = rt.getChildren()[0];
		}
		return rt.getValue()[0];
	}

	BPTreeproto.updateParent = function(rt, info) {
		if (rt.isLeaf()) {
			return rt;
		} else {
			var pos = rt.findHelp(info, 0, rt.size() - 1);
			var next = this.updateParent(rt.getChildren()[pos], info);
			if (next != null && pos == 0) {
				return rt;
			} else if (next != null) {
				rt.setValue(pos - 1, next.getValue()[0]);
			}
			return null;
		}
	}

	BPTreeproto.mergeParent = function(rt, lev) {
		var parentValue = this.list[lev - 1]; //parentValue will be an array
		var index = this.getPosInList(parentValue, rt);
		// Borrow from Left
		if (index != 0 && parentValue[index - 1].size() != 1) {
			// deal with value
			var biggestPos = parentValue[index - 1].size() - 1;
			var biggest = parentValue[index - 1].getValue()[biggestPos];
			parentValue[index - 1].delete(biggest);
			rt.clearValue();
			rt.insert(this.getSmallest(rt.getChildren()[0]));
			// deal with children
			var moveChild = parentValue[index - 1].getChildren()[biggestPos + 1];
			parentValue[index - 1].popChild();
			var lowerBound = rt.getChildrenSize();
			for (var j = lowerBound; j > 0; j--) {
				rt.setChildren(j, rt.getChildren()[j - 1]);
			}
			rt.setChildren(0, moveChild);
      rt.size_child++;
			var node = moveChild;
			while (node.size_child > 0) {
				node = node.getChildren()[0];
			}
			return node;
		}
		// Borrow from Right
		else if (index != parentValue.length - 1 && parentValue[index + 1].size() != 1) {
      console.log("Borrow from Right");
      // deal with value
			var smallest = parentValue[index + 1].getValue()[0];
			parentValue[index + 1].delete(smallest);
			rt.clearValue();
			// deal with children
			rt.setChildren(1, parentValue[index + 1].getChildren()[0]);
			var upperBound = parentValue[index + 1].getChildrenSize() - 1;
			for (var j = 0; j < upperBound; j++) {
				parentValue[index + 1].setChildren(j, parentValue[index + 1].getChildren()[j + 1]);
			}
      parentValue[index + 1].popChild();
			rt.insert(getSmallest(rt.getChildren()[1]));
			var node = parentValue[index + 1];
			while (node.getChildren()[0] != null) {
				node = node.getChildren()[0];
			}
			this.updateParent(node, node.getValue()[0]);
			return null;
		}
		// Merge to the Left - Deal with the Value
		else if (index != 0) {
      console.log("merge to left");
			var prev = parentValue[index - 1];
			// deal with value
			rt.clearValue();
			prev.insert(getSmallest(rt.getChildren()[0]));
			// deal with children
			prev.setChildren(prev.getChildrenSize(), rt.getChildren()[0]);
			rt.clearChildren();
			return rt;
		}
		// Merge to the Right - Deal with the Value
		else {
			// deal with value
			rt.clearValue();
			parentValue[index + 1].insert(this.getSmallest(parentValue[index + 1].getChildren()[0]));
			// deal with children
			var oriSize = parentValue[index + 1].getChildrenSize();
			for (var j = oriSize; j > 0; j--) {
				parentValue[index + 1].setChildren(j, parentValue[index + 1].getChildren()[j - 1]);
			}
			parentValue[index + 1].setChildren(0, rt.getChildren()[0]);
      parentValue[index + 1].size_child++;
			rt.clearChildren();
			return rt;
		}
	}

	BPTreeproto.remove = function(rt, delInfo, lev) {
		if (rt.isLeaf()) { // leaf node
			rt.delete(delInfo);
			return this.mergeLeaf(rt);
		} else { // parent node
			var pos = rt.findHelp(delInfo, 0, rt.size() - 1);
			var change = this.remove(rt.getChildren()[pos], delInfo, lev - 1); // changed child
      if (change != null) {
				var mergeNode = change;
				if (change.size() == 0) { // update parent rt after merging
          change.hide();
					var i = this.getPosInList(this.list[lev - 2], change);
					if (pos == 0) {
						mergeNode = this.list[lev - 2][i + 1];
						while (mergeNode.size_child > 0) {
							mergeNode = mergeNode.getChildren()[0];
						}
					}
          this.list[lev - 2].splice(i, 1); // remove from the list
					var upperBound = rt.getChildrenSize();
					for (var j = pos; j < upperBound - 1; j++) {
						rt.setChildren(j, rt.getChildren()[j + 1]);
					}
					rt.popChild();
					rt.clearValue();
					for (var j = 1; j < upperBound - 1; j++) {
						rt.insert(this.getSmallest(rt.getChildren()[j]));
					}
				} else {// borrow from the right
					if (pos + 1 < rt.getChildrenSize() && rt.getChildren()[pos + 1] == change) {
						pos++;
					}
				}
				if (rt == this.root && rt.getChildrenSize() == 1) {
          rt.hide();
					this.root = rt.getChildren()[0];
          this.list.pop();
          this.level--;
					return this.root;
				} else if (rt.getChildrenSize() == 1) { // need borrow and merge
					return this.mergeParent(rt, lev);
				} else if (change.size() == 0) {
					if (change != mergeNode) {
						return mergeNode;
					}
				} else if (pos != 0) {
					rt.setValue(pos - 1, change.getValue()[0]);
				} else {
					return change;
				}
			}
			return null;
		}
	}

  /**
	 * insert into the B+ Tree
	 *
	 * @param rt      parent Node
	 * @param addInfo new Info that will be added in
	 * @return current TreeNode
	 */
	BPTreeproto.insert = function(rt, addInfo, lev) {
		if (rt.isLeaf()) {
			var checkAdd = rt.insert(addInfo);
			if (checkAdd) {
				this.update = -1;
				return rt;
			} else {
				// split
				var next = this.split(rt, addInfo);
				this.leafValue = this.insertTreeNode(this.leafValue, next);// add in the single linked list
        this.update = next.getValue()[0];
				if (rt == this.root) {
					var parent = BPTreeNode.newNode(["", "", "", ""], this.jsav, this.max, false); // add new parent node
					parent.insert(this.update);
          parent.addChildrenInNode(rt);
          parent.addChildrenInNode(next);
					this.root = parent;
					this.update = -1;
					this.level++;
          var newList = [];
          newList[0] = parent;
					this.list[this.level - 1] = newList;
					return parent;
				}
				return next;
			}
		} else {
			var pos = rt.insertPos(addInfo, 0, rt.size() - 1);
			var next = this.insert(rt.getChildren()[pos], addInfo, lev - 1); // new child
      if (next != rt.getChildren()[pos]) {
				var checkAdd = rt.insert(this.update);
				if (checkAdd) {
					this.addChildren(rt, next, false, null);
					this.update = -1;
					return rt;
				} else {
					// split
					var nextNode = this.parentSplit(rt); // parallel with rt
					this.list[lev - 1] = this.insertTreeNode(this.list[lev - 1], nextNode);
					// change children
					this.addChildren(rt, next, true, nextNode);
					if (rt == this.root) {
						var parent = BPTreeNode.newNode(["", "", "", ""], this.jsav, this.max, false); // add new parent node
						parent.insert(this.update);
            parent.addChildrenInNode(rt);
						parent.addChildrenInNodeIndex(1, nextNode);
						this.root = parent;
						this.update = -1;
						this.level++;
            var newList = [];
            newList[0] = parent;
  					this.list[this.level - 1] = newList;
						return parent;
					}
					return nextNode;
				}
			}
			return rt;
		}
	}

  //following two functions are for ADD and DELETE in the B+Tree
  BPTreeproto.add = function(addInfo) {
    this.insert(this.root, addInfo, this.level);
  }

  BPTreeproto.delete = function(delInfo) {
    if (this.find(this.root, delInfo)) {
      if (this.leafValue.length > 1) {
        this.remove(this.root, delInfo, this.level);
      } else {
        this.root.delete(delInfo);
      }
    } else {
       alert ("Element " + delInfo + " is not found!");
    }
  }

  // Publicize the public functions
  var BPTree = {};
  BPTree.newTree = newTree;
  window.BPTree = BPTree;
});