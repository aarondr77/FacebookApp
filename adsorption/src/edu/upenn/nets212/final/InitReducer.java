package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;


public class InitReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		String node = key.toString();
		StringBuilder adj = new StringBuilder();
		for (Text val : values) {

			adj.append(val.toString() + ";");
		}
		String weights = AdsorptionDriver.makeWeight(node, 1);

		String str = AdsorptionDriver.makeString(node, adj.toString(), weights);
		context.write(new Text(str), new Text());
	}
}
