#!/bin/sh
javac -cp TTFT.jar Tester.java
javac -cp TTFT.jar PublicTTFT.java
jjs -cp TTFT.jar:. testrhino.js
