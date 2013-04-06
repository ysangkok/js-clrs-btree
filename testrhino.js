Array.prototype.compare = function(array) { //prototype defines the .compare as method of any object
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

load(["btree.js"]);

var previous, inserting, inserted, v, deleted;

try {
while (true) {
(function() {
var bt = new btree.BT(2, function(a, b) { return a < b ? -1 : a === b ? 0 : 1; });
bt.root = new btree.BN(bt, [], []);

var ttft = new Packages.PublicTTFT();
ttft.SplitOnTheWayDown(true);
var added = [];
inserting = true;
inserted = null;
deleted = [];
while (true) {
    if (inserting) {
        if (added.length === 20) {
            inserted = added.slice();
            inserting = !inserting;
            print("Deleting");
            continue;
        }
        do {
            v = Math.floor((Math.random())*Math.pow(2,6));
        } while (added.indexOf(v) !== -1);
        added.push(v);
        ttft.Insert(v);
        bt.root.insert(v);
    } else {
        if (added.length === 0) break;
        v = added.splice(Math.floor(Math.random() * added.length), 1)[0];
        if (typeof(v) !== "number") throw new Error("not a number from added: " + v + ", type: " + typeof v + ", instance: " + v.prototype);
        ttft.Delete(v);
        bt.root.remove(v);
        deleted.push(v);
    }
    var javasrc = String(Packages.Tester.dumpJSON(ttft.getRoot()));
    var jssrc = String(bt.root.toJSON());
    if (javasrc.length !== jssrc.length) {
        print("Unequal!" + javasrc.length + jssrc.length);
        print("Java:");
        print(javasrc);
        print("JavaScript:");
        print(jssrc);
        throw new Error();
    }

    var list = bt.root.traverse();
    var sorted = list.slice().sort(function(a,b){return b>a;});
    if (!list.compare(sorted)) {
        print("b-tree not sorted!");
        print(list);
        print(sorted);
        print(jssrc);
        throw new Error();
    }
    previous = javasrc;
}
//ttft.Dump();
/*
print("Java:");
print(Packages.Tester.dumpJSON(ttft.root));

print("JavaScript:");
print(bt.root.toJSON());
*/
print("Success!");
}());
}

} catch (e) {
    print("Catch");
    if (e.rhinoException != null)
        e.rhinoException.printStackTrace();
    else if (e.javaException != null)
        e.javaException.printStackTrace();
    print("previous: " + previous);
    print("tried " + (inserting ? "inserting" : "deleting") + " " + v);
    print("inserted");
    print(inserted);
    print("deleted");
    print(deleted);
    print("working on");
    print(v);
    quit();
}
