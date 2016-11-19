/**
 * @author Souleymane Dia
 * @version <07/01/2016>~ summer 2016
 * Task to be completed:
 * support adding in the middle: ~completed
 * support removing from the middle and end ~completed
 * apply more defensinve programing to make sure arguments are passed in approprietly ~completed 
 * add more comments ~completed
 * makes the code more flexible by changing hardcoded values ~completed
 * delete debugging helpers codes ~completed
 * follow the naming convention and structure the class ~completed
 */
//(function($) {
"use strict";
//if (typeof JSAV === "undefined") {
//  return;
//}
/********************************************************************
 * Add the SkipList constructor to the public facing JSAV interface.
 ********************************************************************/
JSAV.ext.ds.skiplist = function(options) {

    var ex_options = $.extend(true, {
      visible: true,
      autoresize: true
    }, options);
    // create a new SkipList object
    return new SkipList(this, ex_options);
  }
  /**********************************************************************
   * Implement SkipList data structure.
   *********************************************************************/
function SkipList(jsav, options) {
  this.init(jsav, options);
};
// Get SkipList prototype
var SkipListProto = SkipList.prototype;
var pointerLen = 72;
var hztalDist = 70;
/**
 * initialize the SkipList. Create an empty head
 * @param jsav The JSAV object for this skiplist
 * @param options Options to be passed to the skiplist structure
 */
SkipListProto.init = function(jsav, options) {
  this.jsav = jsav; // set the jsav object for this tree
  this.level = 0; // level of the tree
  // use specific starting point and ending point
  this.options = $.extend({
    layout: "vertical",
    indexed: true,
    left: 250,
    top: 42
  }, options);
  // create an empty SkipNode and set it as root
  this.head = new SkipNode(null, this.level + 1, this.jsav, this.options, 0);
  this.size = 0;
};
/** generate a random value, note that the 237 is arbitrary and could have been any number
  also we are preventing the depth to be greater than 4 */
var randomLevel = function() {
  var lev = 0;
  var rand = function() {
    return Math.floor(Math.random() * 237);
  };
  for (lev = 0;
    (rand() % 2) === 0; lev++) {} // preventing depth to be bigger than four
  if (lev > 4)
    lev = 4;
  return lev;
};
/** adjust the depht of the head if needed */
var adjustHead = function(nLev, head, oldLev, jsav, options) {
  var oldHead = head;
  head = new SkipNode(null, nLev, jsav, options, 0);
  for (var i = 0; i <= oldLev; i++) {
    head.getForward()[i] = oldHead.getForward()[i];
    head.getDispArr().value(i, oldHead.getDispArr().value(i));
  }
  return head;
};
/** insert a kv pair into a the SkipList */
SkipListProto.insert = function(it) {
  if (!(it instanceof KVPair)) {
    throw new Error("illegal arguments Exception: arg must be of type KVPair")
  }
  var newLevel = randomLevel();
  if (this.level < newLevel) {
    var flag = false;
    if (this.level + 1 < newLevel) {
      var flag = true;
      this.jsav.step();
      this.jsav.umsg("the randon depth of the node to be insert is " +
        newLevel + ", so we must adjust the depth of our head node before inserting");
      this.jsav.step();
    }
    this.head = adjustHead(newLevel, this.head, this.level, this.jsav,
      this.options);
    this.level = newLevel;
    (flag === true) ? this.jsav.step(): flag = false;
  }
  var update = new Array(this.level + 1);
  var x = this.head;
  for (var i = this.level; i >= 0; i--) { // Find insert position
    while ((x.getForward()[i] !== null) &&
      (x.getForward()[i] !== undefined) &&
      (it.compareTo((x.getForward()[i]).getPair().getKey())) > 0) {
      x = x.getForward()[i];
    }
    update[i] = x; // Track end at level i
  }
  var xfwrd = x.getForward()[0];
  if (xfwrd !== null) { // inserting in the middle
    var newOption = $.extend({}, xfwrd.getOptions());
    var i = 0;
    while (xfwrd !== null) {
      var disOption = xfwrd.getOptions();
      xfwrd.incrNodeNum();
      var newOp = xfwrd.getNewOp();
      newOp.left += 70;
      disOption.left += 70;
      xfwrd.updateDis(disOption, newOp);
      xfwrd.movePointerRight(x.getLevel(), update[0].getNodeNum() + 1, i);
      i++;
      x = xfwrd;
      xfwrd = x.getForward()[0];
    }
    insertMidHelper(it, x, update, newOption, this.jsav, newLevel);
  } else { // inserting at the end
    var newOption = {
      left: this.options.left + (this.size + 1) * 70,
      top: this.options.top,
      layout: "vertical"
    };
    insertEndHelper(it, x, update, newOption, this.jsav, newLevel);
  }
  this.size++; // Increment dictionary size
  return true;
};
/** helper function to insert in the middle */
var insertMidHelper = function(it, x, update, newOption, jsav, newLevel) {
    jsav.umsg("This key is to be insert in the middle so we must make space to insert and update pointers");
    jsav.step();
    x = new SkipNode(it, newLevel, jsav, newOption, (update[0].getNodeNum() + 1));
    jsav.step();
    jsav.umsg("update pointers");
    var xfwr = x.getForward();
    for (var j = 0; j <= newLevel; j++) { // Splice into list
      xfwr[j] = update[j].getForward()[j]; // Who x points to
      update[j].getForward()[j] = x; // Who y points to
      var longer = (x.getNodeNum() - update[j].getNodeNum());
      if (xfwr[j] != null) {
        x.updateArrDis(j);
      }
      if (xfwr[j] == null) {
        update[j].updateArrDis(j);
      }
      //jsav.step();
      jsav.umsg("update pointers");
      x.setPointer(j, jsav.pointer(" ", x.getDispArr(), {
        targetIndex: j,
        left: -(longer - 1) * 70 - 55,
        top: 22,
        arrowAnchor: "left center",
        fixed: false
      }));
      if (xfwr[j] != null) {
        longer = (xfwr[j].getNodeNum() - x.getNodeNum());
        xfwr[j].updateNextPointer(longer, j);
      }
    }
  }
  /** helper function for inserting at the end */
var insertEndHelper = function(it, x, update, newOption, jsav, newLevel) {
    x = new SkipNode(it, newLevel, jsav, newOption, (update[0].getNodeNum() + 1));
    for (var j = 0; j <= newLevel; j++) { // Splice into list
      x.getForward()[j] = update[j].getForward()[j]; // Who x points to
      update[j].getForward()[j] = x; // Who y points to
      update[j].updateArrDis(j);
      var longer = (x.getNodeNum() - update[j].getNodeNum())
      x.setPointer(j, jsav.pointer(" ", x.getDispArr(), {
        targetIndex: j,
        left: -(longer - 1) * 70 - 55,
        top: 22,
        arrowAnchor: "left center",
        fixed: false
      }));
    }
  }
  /** searching for a particular key */
SkipListProto.search = function(otherKey) {
    var unhigh = new Array(this.size + 3);
    var ind = 0;
    var result = " ";
    var x = this.head; // Dummy header node
    var j = this.level
    this.jsav.umsg("Searching for key: " + otherKey + " starting at the deepest level")
    unhigh[ind++] = x.getDispArr().highlight(j);
    this.jsav.step();
    for (var i = j; i >= 0; i--) { // go forward
      while ((x.getForward()[i] !== null) &&
        (otherKey, x.getForward()[i].getPair().compareTo(otherKey) < 0)) {
        var xfwr = x.getForward()[i];
        if (xfwr !== null) {
          unhigh[ind++] = xfwr.getDispArr().highlight(i);

          this.jsav.umsg("we compare " + otherKey + " to the next record " +
            xfwr.getPair().getKey() + ". If what it points to is less, we move forward, else we go down a level");
          this.jsav.step();
        }
        x = x.getForward()[i];

      } // Go one last step
    }
    unhigh[ind++] = x.getDispArr().highlight(0);
    this.jsav.umsg("we go down to the lowest level");
    this.jsav.step();
    x = x.getForward()[0]; // Move to actual record, if it exists
    if (x !== null) {
      while ((x.equalKey(otherKey) === 0)) {
        result += x.getPair().getVal().toString();
        x = x.getForward()[0];
      }
      unhigh[ind++] = x.getDispArr().highlight(0);
      this.jsav.umsg("now we move to the record muching our key " + otherKey);
      this.jsav.step();
    } else {
      this.jsav.umsg("key " + otherKey + " not found");
      this.jsav.step();
    }
    for (var i = 0; i < ind; i++) {
      unhigh[i].unhighlight();
    }
    return result;
  }
  /** helper function for remove */
var find = function(val, head) {
    var valFound = head.getForward()[0];
    while ((valFound !== null) && !(val === valFound.getPair().getVal())) {
      valFound = valFound.getForward()[0];
    }
    if (valFound !== null) {
      return valFound.getPair();
    }
    return null;
  }
  /** remove by key */
SkipListProto.removeKey = function(otherKey) {
  this.jsav.step();
  this.jsav.umsg("To remove " + otherKey + " we must search find then disconnect pointer");
  this.jsav.step();
  var x = this.head;
  var removed = null;
  var update = new Array(this.level + 1);
  for (var j = this.level; j >= 0; j--) { // go forward
    while ((x.getForward()[j] !== null) &&
      (x.getForward()[j].getPair().compareTo(otherKey) < 0)) {
      x = x.getForward()[j];
    } // Go one last step
    update[j] = x;
  }
  if (x.getForward()[0] !== null &&
    (x.getForward()[0].getPair().compareTo(otherKey) === 0)) {
    removed = x.getForward()[0];
    this.jsav.umsg("We have successfull find our key in the SkipList, We need to remove and reset pointers");
    removed.getDispArr().highlight(0);
    for (var i = 0; i <= this.level; i++) { // Splice into list
      var upFwrd = update[i].getForward()[i];
      while (upFwrd != null &&
        (upFwrd.getNodeNum() === removed.getNodeNum())) {
        if (upFwrd.getForward()[i] == null) {
          update[i].resetArrDis(i);
        }
        upFwrd = (upFwrd.getForward()[i]);
        update[i].getForward()[i] = upFwrd;
        break; // break so that it does not remove all duplicate
      } // Who x points to
    }
    this.jsav.step();
    removed.getDispArr().highlight(0);
    this.size--; // Increment dictionary size
    if (removed.getForward()[0] == null) { // if removing from the end
      removed.clear();
    } else { // removing from the middle
      removed.clear();
      var x = removed;
      var xfwr = x.getForward()[0];
      while (xfwr !== null) {
        var disOption = xfwr.getOptions();
        xfwr.decrNodeNum();
        var newOp = xfwr.getNewOp();
        newOp.left -= 70;
        disOption.left -= 70;
        xfwr.updateDis(disOption, newOp);
        xfwr.movePointerLeft(x.getLevel(), removed.getNodeNum() - 1, i);
        i++;
        x = xfwr;
        xfwr = x.getForward()[0];
      }
      updateNxt(update, this.jsav);
    }
    return removed.getPair();

  } else {
    return null;
  }
};
/** updating pointers */
var updateNxt = function(update, jsav) {
    for (var i = 0; i < update.length; i++) {
      var upFwrd = update[i].getForward();
      if (upFwrd[i] != null) {
        var longer = upFwrd[i].getNodeNum() - update[i].getNodeNum();
        var opt = {
          targetIndex: i,
          left: -(longer - 1) * 70 - 55,
          top: 22,
          arrowAnchor: "left center",
          fixed: false
        }
        upFwrd[i].updPter(i, opt);
      }
    }
  }
  /** removing by value */
SkipListProto.removeVal = function(otherVal) {
  var x = this.head;
  var result = find(otherVal, x);
  if (result == null) {
    return null;
  } else {
    return this.removeKey(result.getKey());
  }
}

/*******************************************************************************************
 * SkipNode script
 ******************************************************************************************/
/**
 * @author Souleymane Dia
 * @version <05/24/2016>~ summer 2016
 * represent the Skipnode script use in the SkipList implementation
 */
function SkipNode(p, nodeLevel, jsav, options, num) {
  this.jsav = jsav;
  this.options = options;
  this.nodeNum = num;
  this.pair = p;
  this.nodeLevel = nodeLevel;
  this.arr = new Array(nodeLevel + 1);
  this.forward = new Array(nodeLevel + 1);
  this.pointer = new Array(nodeLevel + 1);
  for (var i = 0; i < nodeLevel + 1; i++) {
    this.arr[i] = 'null';
    this.forward[i] = null;
    this.pointer[i] = null;
  }
  this.disArr = this.jsav.ds.array(this.arr, options);
  this.newOp = $.extend(true, {
    autoresize: true
  }, this.options);
  this.newOp.indexed = false;
  this.newOp.top = 10;
  this.newOp.left = (this.options.indexed === true) ? this.options.left + 8 : this.options.left;
  if (this.pair === null) {
    this.val = jsav.ds.array(['Hd'], this.newOp);
  } else {
    this.val = jsav.ds.array([p.toString()], this.newOp);
  }
}
var skipNodeProto = SkipNode.prototype;
skipNodeProto.updateDis = function(options, newOp) {
  this.val.hide();
  this.val = this.jsav.ds.array([this.pair.toString()], newOp);
  this.disArr.hide();
  this.disArr = this.jsav.ds.array(this.arr, options);
  this.val.show();
  this.disArr.show();
};
skipNodeProto.resetArrDis = function(i) {
  this.arr[i] = "null";
  this.disArr.value(i, "null");
};
skipNodeProto.updateArrDis = function(i) {
  this.arr[i] = " ";
  this.disArr.value(i, " ");
};
skipNodeProto.equalKey = function(other) {
  return (this.pair.getKey() === other);
};
skipNodeProto.equals = function(other) {
  return (this.pair.getKey() === other.pair.getKey()) &&
    (this.pair.getVal() === other.pair.getVal());
};
skipNodeProto.getNewOp = function() {
  return this.newOp;
};
skipNodeProto.getNodeNum = function() {
  return this.nodeNum;
};
skipNodeProto.incrNodeNum = function(i) {
  this.nodeNum++;
};
skipNodeProto.getOptions = function() {
  return this.options;
};
skipNodeProto.updateNextPointer = function(longer, j) {
  this.pointer[j].hide();
  this.pointer[j] = this.jsav.pointer(" ", this.disArr, {
    targetIndex: j,
    left: -(longer - 1) * 70 + (-55),
    top: 22,
    arrowAnchor: "left center",
    fixed: false,
    "stroke-width": 2
  });
}
skipNodeProto.movePointerRight = function(lev, longer, t) {
  var point = this.pointer;
  for (var i = 0;
    (i < (this.nodeLevel + 1) && point[i] !== null); i++) {
    var lef = this.pointer[i].options.left;
    this.pointer[i].hide();
    var d = -((this.nodeNum - longer) - 1) * 70 - 55;
    d = -d;
    this.pointer[i] = this.jsav.pointer(" ", this.disArr, {
      targetIndex: i,
      left: (t == 0) ? lef - 70 : (d <= -lef) ? lef - 70 : lef,
      top: 22,
      arrowAnchor: "left center",
      fixed: false,
      "stroke-width": 2
    });
  }
};
skipNodeProto.decrNodeNum = function(i) {
  this.nodeNum--;
};
skipNodeProto.movePointerLeft = function(lev, longer, t) {
  var point = this.pointer;
  for (var i = 0;
    (i < (this.nodeLevel + 1) && point[i] !== null); i++) {
    var lef = this.pointer[i].options.left;
    this.pointer[i].hide();
    var d = -((this.nodeNum - longer)) * 70 - 55;
    d = -d;
    this.pointer[i] = this.jsav.pointer(" ", this.disArr, {
      targetIndex: i,
      left: (d > -lef) ? lef : lef + 70,
      top: 22,
      arrowAnchor: "left center",
      fixed: false
    });
    this.pointer[i].css({
      "stroke-width": 2
    });
  }
}
skipNodeProto.updPter = function(i, opt) {
  this.pointer[i].hide();
  this.pointer[i] = this.jsav.pointer(" ", this.disArr, opt);
  this.pointer[i].css({
    "stroke-width": 2
  });
};
skipNodeProto.clear = function(i, pt) {
  for (var i = 0; i < this.nodeLevel + 1; i++) {
    this.pointer[i].hide();
  }
  this.disArr.hide();
  this.val.hide();
};
skipNodeProto.setPointer = function(i, pt) {
  return this.pointer[i] = pt;
  this.pointer[i].css({
    "stroke-width": 2
  });
};
skipNodeProto.getLevel = function() {
  return this.nodeLevel;
};
skipNodeProto.getForward = function() {
  return this.forward;
};
skipNodeProto.getDispArr = function() {
  return this.disArr;
};
skipNodeProto.getPair = function(forward) {
  return this.pair;
};
skipNodeProto.toString = function() {
  if (this.pair === null) {
    return 'Node has depth ' + this.nodeLevel + ', Value (null) ';
  } else if (this.pair.getVal() === null) {
    return 'Node has depth ' + this.nodeLevel + ', Value (null) ';
  } else {
    return 'Node has depth ' + this.nodeLevel + ', Value ' +
      this.pair.toString();
  }
};
// ---------------------------------------------------------------------------
// Add interface for array methods
// ---------------------------------------------------------------------------

skipNodeProto.isHighlight = function(index, options) {
  this.disArr.isHighlight(index, options);
};

skipNodeProto.highlight = function(indices, options) {
  this.disArr.highlight(indices, options);
};

skipNodeProto.unhighlight = function(indices, options) {
  this.disArr.unhighlight(indices, options);
};

skipNodeProto.css = function(indices, cssprop, options) {
  this.disArr.css(indices, cssprop, options);
};

skipNodeProto.index = function(index) {
  this.disArr.index(index);
};

skipNodeProto.swap = function(index1, index2, options) {
  this.disArr.swap(index1, index2, options);
};
/*****************************************************************************************************
 * KVPair script implementation
 ****************************************************************************************************/

/**
 * @author Souleymane Dia
 * @version <05/24/2016>~ summer 2016
 * This represent the Key value pair script (KVPair) used in the SkipList implementation
 */
function KVPair(k, v) {
  this.key = k;
  this.value = v;
}
KVPair.prototype.getKey = function() {
  return this.key;
};
KVPair.prototype.getVal = function() {
  return this.value;
};
/** compare to KVPair value */
KVPair.prototype.compareTo = function kvlocaleCompare(otherKey) {
  var rsl = null;
  if (typeof(this.key) === 'number' && typeof(otherKey) === 'number') {
    rsl = this.key - otherKey;
    return rsl;
  } else if ((typeof(this.key) === 'number') || (typeof(otherKey) === 'number')) {
    throw new Error("illegal arguments: type mismatch");
  }
  rsl = first.localeCompare(otherKey);
  return rsl;
};
KVPair.prototype.toString = function kvToString() {
  if (this === null) {
    return 'null';
  }
  return '' + this.key;
};