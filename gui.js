function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function readInput() {
    return (isNumber(document.getElementById('treekeyvalue').value)
        ? [parseFloat(document.getElementById('treekeyvalue').value)]
        : document.getElementById('treekeyvalue').value.split(",").map(function(v){ return isNumber(v) ? parseFloat(v) : v; }));
}

function init(id, mid) {
    var insrc = document.getElementById(id).value;
    initTree(JSON.parse(insrc), parseInt(document.getElementById(mid).value, 10));
    draw();
}

function initTree(insrc, m) {
    var bt = window.bt = new btree.BT(m, function(a, b) { return a < b ? -1 : a === b ? 0 : 1; });
    bt.root = btree.BN.prototype.fromJSON(bt, insrc);
}

function draw() {
    var dot = document.getElementById("out").value = window.bt.root.toGraphViz();
    document.getElementById("svgelem").innerHTML = Viz(dot, "svg");
}

function tojson() {
    document.getElementById("out").value = window.bt.root.toJSON();
}

function traverse() {
    document.getElementById("out").value = JSON.stringify(window.bt.root.traverse());
}

function del(keys) {
    checkTreeIsInited();
    keys.forEach(function(key) {window.bt.root.remove(key);});
    draw();
    setEnterAction("del");
}

function checkTreeIsInited() {
    if (typeof(window.bt) === "undefined") {
        alert("Tree uninitalized!");
        throw new Error("Tree uninitalized!");
    }
}

function ins(keys) {
    checkTreeIsInited();
    keys.forEach(function(key) {window.bt.root.insert(key);});
    draw();
    setEnterAction("ins");
}

function swap(ent) {
    ent.fontWeight = (ent.fontWeight === "bold") ? "" : "bold";
}

function setEnterAction(act) {
    if (window.action !== window[act]) {
        swap(document.getElementById(act + "_button").style);
        swap(document.getElementById((act == "ins" ? "del" : "ins") + "_button").style);
    }
    window.action = window[act];
}

function deleteOrInsert(e) {
    if (e.keyCode === 13) {
        if (typeof(window.action) === "undefined") {
            setEnterAction("ins");
        }
        window.action(readInput());
    }
}

function scheduleNext(idx) {
    var h = decodeURIComponent(window.location.hash.substring(1));
    if (!h) return;
    h = JSON.parse(h);
    var v = h["actions"][idx % h["actions"].length];
    window.setTimeout(function() {
        console.log(v);
        var fun;
        if (v[0] === "initTree")
            fun = window["initTree"];
        else
            fun = window.bt.root[v[0]];
        Function.prototype.apply.call(fun, window.bt ? window.bt.root : null, v.slice(1));
        draw();
        scheduleNext(idx+1);
    }, h["delay"] ? h["delay"] : 1000);
}
