Array.prototype.compare = function(array) { //prototype defines the .compare as method of any object
    //return this.toString() === array.toString();
    if (this.length !== array.length) //first compare length - saves us a lot of time
      return false;
    for (var i=0; i<this.length; i++) {
      if (this[i] instanceof Array && array[i] instanceof Array){ //Compare arrays
          if (!this[i].compare(array[i])) //!recursion!
            return false;
      } else if (this[i] !== array[i]) { //Warning - two diferent objec instances will never be equal: {x:20}!={x:20}
          return false;
      }
    }
    return true;
};

function traversejson(obj) {
    var acc = [];
    for (var i=0; i<obj.keys.length; i++) {
        if (obj["children"] && obj.children[i]) acc = acc.concat(traversejson(obj.children[i]));
        acc.push(obj.keys[i]);
    }
    if (obj["children"] && obj.children[i]) acc = acc.concat(traversejson(obj.children[i]));
    return acc;
}

var rhino = typeof(importPackage) !== "undefined";
var nodejs = typeof(process) !== "undefined";

if (rhino) {
    load(["btree.js"]);
} else if (nodejs) {
    var btree = require("./btree");
    var print = console.log;
    var quit = process.exit;
} else {
    load("btree.js");
}

var previous, inserting, inserted, v, deleted;

try {
while (true) {
var start = new Date();
(function() {
var bt = new btree.BT(2, function(a, b) { return a < b ? -1 : a === b ? 0 : 1; });
bt.root = new btree.BN(bt, [], []);

if (!nodejs) {
    var ttft = new Packages.PublicTTFT();
    ttft.SplitOnTheWayDown(true);
}
var added = [];
inserting = true;
inserted = null;
deleted = [];
while (true) {
    if (inserting) {
        if (added.length === (nodejs ? 500 : 200)) {
            inserted = added.slice();
            inserting = !inserting;
            continue;
        }
        do {
            v = Math.floor((Math.random())*Math.pow(2,31));
        } while (added.indexOf(v) !== -1);
        added.push(v);
        if (!nodejs) ttft.Insert(v);
        bt.root.insert(v);
    } else {
        if (added.length === 0) break;
        v = added.splice(Math.floor(Math.random() * added.length), 1)[0];
        if (typeof(v) !== "number") throw new Error("not a number from added: " + v + ", type: " + typeof v + ", instance: " + v.prototype);
        if (!nodejs) ttft.Delete(v);
        bt.root.remove(v);
        deleted.push(v);
    }
    if (!nodejs) var javasrc = String(Packages.Tester.dumpJSON(ttft.getRoot()));
    var jssrc = String(bt.root.toJSON());
    if (!nodejs && (javasrc.length !== jssrc.length || !traversejson(JSON.parse(javasrc)).compare(traversejson(JSON.parse(jssrc))))) {
        throw new Error("Unequal! Java: " + javasrc.length + " JS: " + jssrc.length + "\n" +
        "Java:\n" +
        javasrc + "\n" +
        "JavaScript:\n" +
        jssrc);
    }

    var list = bt.root.traverse();
    var sorted = list.slice();
    sorted.sort(function(a,b){return Number(a)>Number(b) ? 1 : Number(a)<Number(b) ? -1 : 0;});
    if (!list.compare(sorted)) {
        throw new Error("b-tree not sorted!\nOrg List:" + list + "\nSorted  :" + sorted + "\n" + jssrc);
    }
    previous = jssrc;
}
}());
var end = new Date();
print("Iteration" + (String)(end-start));
}

} catch (e) {
    print("Catch: " + e);
    if (e.rhinoException != null)
        e.rhinoException.printStackTrace();
    else if (e.javaException != null)
        e.javaException.printStackTrace();
    print("previous: " + previous);
    print("tried " + (inserting ? "inserting" : "deleting") + ": " + v);
    print("inserted:");
    print(inserted);
    print("deleted:");
    print(deleted);
    print("working on:");
    print(v);
}
