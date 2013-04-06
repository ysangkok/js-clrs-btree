#!/bin/sh
javac -cp TTFT.jar Tester.java
javac -cp TTFT.jar PublicTTFT.java
java -cp /usr/share/maven-repo/rhino/js/1.7R3/js-1.7R3.jar:TTFT.jar:. org.mozilla.javascript.tools.shell.Main -strict -opt -1 testrhino.js
