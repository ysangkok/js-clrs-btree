#!/bin/sh
javac -cp TTFT.jar Tester.java
javac -cp TTFT.jar PublicTTFT.java
java -cp /usr/share/maven-repo/rhino/js/1.7R4/js-1.7R4.jar:TTFT.jar:. org.mozilla.javascript.tools.shell.Main -strict testrhino.js
