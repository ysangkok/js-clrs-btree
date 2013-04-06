import java.util.*;
import java.io.*;
public class Tester {
	public static void main(String[] args) throws Exception {
		TTFT ttft = new TTFT();
		ttft.SplitOnTheWayDown(true);
		for (int i : new int[] {10, 20, 30, 1, 2, 3, 11, 12, 13, 21, 22, 23, 31, 32, 33})
			ttft.Insert(i);
		ttft.Dump();
		System.out.println(dumpJSON(ttft.root));
	}
	
	public static String dumpJSON(TTFT.Node todump) {
		StringBuffer keysb = new StringBuffer("[");
		StringBuffer cldsb = new StringBuffer("[");
		int i=0;
		for (i=0; i<todump.numvals; i++) {
			keysb.append(todump.vals[i]);
			keysb.append(",");
            if (todump.children[i] != null) {
    			cldsb.append(dumpJSON(todump.children[i]));
			    cldsb.append(",");
            }
		}
		if (keysb.length() > 1) keysb.deleteCharAt(keysb.length()-1);
		if (todump.children[i] != null) cldsb.append(dumpJSON(todump.children[i]));
		//cldsb.deleteCharAt(cldsb.length()-1);
		keysb.append("]");
		cldsb.append("]");
		return ("{\"keys\":" + keysb.toString() + ",\"children\":" + cldsb.toString() + "}").replace(",\"children\":[]","");
	}
}

