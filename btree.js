(function(exports){

var BT = exports.BT = function(M, comparefunc) {
    this.M = M;
    this.maxNumberKeys = 2*M-1;
    this.minNumberKeys = M-1;
    this.root = null;
    this.compare = comparefunc;
};

var BN = exports.BN = function(bt, keys, children) {
    this.bt = bt;
    this.keys = keys;
    this.children = children;
};

BN.prototype.fromJSON = function(bt, json) {
    return new BN(bt, json.keys, !json.children ? [] : json.children.map(
        function (child) {
            return BN.prototype.fromJSON(bt, child);
        }
    ));

};

BN.prototype.toJSON = function() {
    var cldsb;
    cldsb = "[";
    for (var i=0; i<this.numberKeys(); i++) {
        if (!this.isLeaf())
            cldsb += this.children[i].toJSON() + ",";
    }
    if (!this.isLeaf())
        cldsb += this.children[i].toJSON();

    cldsb += "]";
    return ("{\"keys\":" + JSON.stringify(this.keys) + ",\"children\":" + cldsb.toString() + "}").replace(",\"children\":[]","");
};

BN.prototype.traverse = function() {
    var acc = [];
    for (var i=0; i<this.numberKeys(); i++) {
        if (this.children[i]) acc = acc.concat(this.children[i].traverse());
        acc.push(this.keys[i]);
    }
    if (this.children[i]) acc = acc.concat(this.children[i].traverse());
    return acc;
};

BN.prototype.findLargest = function() {
    if (this.isLeaf()) {
        return this.keys[this.numberKeys()-1];
    } else {
        return this.children[this.numberKeys()].findLargest();
    }
};

BN.prototype.findSmallest = function() {
    if (this.isLeaf()) {
        return this.keys[0];
    } else {
        return this.children[0].findSmallest();
    }
};

BN.prototype.toGraphViz = function() {
    var writer = new Writer();

    this.walk(new Counter(), writer);

    return    "digraph g {\n" +
        "node [shape = record,height=.1];\n" +
        writer.buf + "\n" +
        "}";
};

BN.prototype.walk = function(counter, writer) {
    var nodeid = "node" + String(counter.add()) ;
    writer.write(nodeid + "[label = \"");
    for (var i=0; i<this.numberKeys(); i++) {
        writer.write("<f" + String(i) + "> |");
        writer.write(String(this.keys[i]));
        writer.write("|");
    }
    writer.writeln("<f" + String(i) + ">\"];");

    var childNum = -1;
    var outer = this;
    this.children.forEach(function(child) {
        childNum++;
        var childnodeid = child.walk(counter, writer);
        writer.writeln("\"" + nodeid + "\":f" + String(childNum) + " -> \"" + childnodeid + "\"");
    });

    return nodeid;
};

BN.prototype.remove = function(K) {
    var i, pos = this.keys.indexOf(K);
    //console.log("deleting in key", this.keys, "pos", pos);
    if (pos !== -1) { // key k is in node x
        if (this.isLeaf()) { // x is a leaf
            //console.log("case 1");
            this.keys.splice(pos, 1);
            return null;
        } else {
            var k_strich;
            if (this.children[pos].numberKeys() >= this.bt.M) {
                //console.log("case 2a");
                k_strich = this.children[pos].findLargest();
                this.keys[pos] = k_strich;
                return this.children[pos].remove(k_strich);
            } else if (this.children[pos+1].numberKeys() >= this.bt.M) {
                //console.log("case 2b"); // z.B. C löschen aus baum (a)
                k_strich = this.children[pos+1].findSmallest();
                this.keys[pos] = k_strich;
                return this.children[pos+1].remove(k_strich);
            } else {
                //console.log("case 2c");
                this.children[pos].keys = this.children[pos].keys.concat(this.keys[pos]).concat(this.children[pos+1].keys);
                this.children[pos].children = this.children[pos].children.concat(this.children[pos+1].children);
                for (i=pos; i<this.numberKeys(); i++) {
                    this.keys[i] = this.keys[i+1];
                    this.children[i+1] = this.children[i+2];
                }
                this.keys = this.keys.filter(function(v) { return typeof(v) !== "undefined"; });
                this.children = this.children.filter(function(v) { return typeof(v) !== "undefined"; });
                if (this.numberKeys() === 0) this.bt.root = this.children[pos];
                return this.children[pos].remove(K);
            }
        }
    } else {
        //console.log("case 3");
        i = this.findChildSlot(K);
        var j = i;
        //console.log("subtree chosen", i);
        var destnode = this.children[i];
        var nachbarn = [];

        if (typeof(this.children[i-1]) !== "undefined")
            nachbarn.push(this.children[i-1]);

        if (typeof(this.children[i+1]) !== "undefined")
            nachbarn.push(this.children[i+1]);

        var ersteNachbar = nachbarn[0];
        var letzteNachbar = nachbarn[nachbarn.length-1];

        if (destnode.isEmpty()) {
            if (nachbarn.every(function(nachbar){ return nachbar.isEmpty(); })) {
                //console.log("case 3b");
                var l = Math.min(this.children.indexOf(ersteNachbar), j);
                if (this.children.indexOf(ersteNachbar) < this.children.indexOf(destnode)) {
                    destnode.keys = ersteNachbar.keys.concat(this.keys.splice(l,1)).concat(destnode.keys);
                    destnode.children = ersteNachbar.children.concat(destnode.children);
                } else {
                    destnode.keys = destnode.keys.concat(this.keys.splice(l,1)).concat(ersteNachbar.keys);
                    destnode.children = destnode.children.concat(ersteNachbar.children);
                }
                this.children.splice(this.children.indexOf(ersteNachbar),1);
                if (this.keys.length === 0 && this == this.bt.root) this.bt.root = destnode;
            } else {
                //console.log("case 3a");
                var hat_t = nachbarn.filter(function(nachbar) { return !nachbar.isEmpty(); })[0];
                j -= this.children.indexOf(hat_t) < this.children.indexOf(destnode);
                if (j < 0) j = 0;
                var goingright = this.children.indexOf(hat_t) < this.children.indexOf(destnode);
                if (goingright) {
                    // z.B N löschen aus baum (a)
                    destnode.keys = [this.keys[j]].concat(destnode.keys);
                    this.keys[j] = hat_t.keys.splice(hat_t.numberKeys()-1, 1)[0];
                    destnode.children = hat_t.children.splice(hat_t.numberKeys()+1, 1).concat(destnode.children);
                } else {
                    // z.B B löschen aus baum (e')
                    destnode.keys = destnode.keys.concat(this.keys[j]);
                    this.keys[j] = hat_t.keys.splice(0, 1)[0];
                    destnode.children = destnode.children.concat(hat_t.children.splice(0, 1)); 
                }
            }
        }
        return destnode.remove(K);
    }
};

BN.prototype.findChildSlot = function(K) {
    for (var i=0; i<this.numberKeys(); i++) {
        if (this.bt.compare(this.keys[i], K) !== -1) {
            break;
        }
    }
    return i;
};

BN.prototype.insert = function(K) {
    if (this === this.bt.root && this.isFull()) {
        this.bt.root = new BN(this.bt, [], [this]);
        this.bt.root.splitChild(0);
        return this.bt.root.insert(K);
    }

    var j = this.findChildSlot(K);

    if (this.isLeaf()) {
        this.keys = this.keys.slice(0,j).concat(K).concat(this.keys.slice(j));
        return null;
    } else {
        var destnode;
        if (this.children[j].isFull()) {
            var median = this.splitChild(j);
            destnode = this.bt.compare(K, median) === -1 ? this.children[j] : this.children[j+1];
        } else {
            destnode = this.children[j];
        }
        return destnode.insert(K);
    }
};

BN.prototype.splitChild = function(idx) {
    var part1keys = this.children[idx].keys.slice(0,this.bt.M-1);
    var part1children = this.children[idx].children.slice(0,this.bt.M);

    var part2keys = this.children[idx].keys.slice(this.bt.M);
    var part2children = this.children[idx].children.slice(this.bt.M);

    this.keys = this.keys.slice(0, idx).concat(this.children[idx].keys[this.bt.M-1]).concat(this.keys.slice(idx));
    this.children = this.children.slice(0, idx).concat([
            new BN(this.bt, part1keys, part1children),
            new BN(this.bt, part2keys, part2children),
            ]).concat(this.children.slice(idx+1));
    return this.keys[idx];
};

BN.prototype.isFull = function() {
    return this.numberKeys() === this.bt.maxNumberKeys;
};

BN.prototype.toString = function() {
    return "BN(keys=" + JSON.stringify(this.keys) + ", children=" + JSON.stringify(this.children.map(function(child) { return child.numberKeys(); })) + ")";
};

BN.prototype.isLeaf = function() {
    return this.children.length === 0;
};

BN.prototype.isEmpty = function() {
    return this.numberKeys() === this.bt.minNumberKeys;
};

BN.prototype.numberKeys = function() {
    return this.keys.length;
};

function Writer() {
    this.buf = "";
}

Writer.prototype.write = function(str) {
    this.buf += String(str);
};

Writer.prototype.writeln = function(str) {
    this.write(String(str) + "\n");
};

function Counter() {
    this.count = 0;
}

Counter.prototype.add = function() {
    return this.count++;
};

})(typeof exports === 'undefined'? this['btree']={}: exports);
