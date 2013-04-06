var java = require("java");
java.classpath.push("TTFT.jar");
var ttft = new java.newInstanceSync("TTFT");
ttft.SplitOnTheWayDownSync(true);
[10, 20, 30, 1, 2, 3, 11, 12, 13, 21, 22, 23, 31, 32, 33].forEach(function(v) {
    ttft.InsertSync(v);
});
ttft.DumpSync();
