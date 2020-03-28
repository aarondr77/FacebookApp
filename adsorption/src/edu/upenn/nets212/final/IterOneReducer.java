package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;
import java.util.HashSet;


public class IterOneReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		System.out.println("\n\n\nRUNNING ITER ONE RED:" + key.toString());
		double sum = 0;
		HashSet<String> cache = new HashSet<String>();
		for (Text value : values) {
			String str = value.toString();
			if (AdsorptionDriver.isInterm(str)) {
				cache.add(str);
				sum += AdsorptionDriver.getIntermWeight(str);
			} else {
				context.write(new Text(str), new Text());
			}
		}
		System.out.println("Sum:" + sum);


		for (String str : cache) {
			System.out.println("running:" + str);
			String to = AdsorptionDriver.getIntermTo(str);
			String label = AdsorptionDriver.getIntermLabel(str);
			Double weight = AdsorptionDriver.getIntermWeight(str) / sum;
			String newInterm = AdsorptionDriver.makeIntermString(to, label, weight + "");
			System.out.println("\n Outputting valid:" + newInterm);
			context.write(new Text(newInterm), new Text());
		}
	}
}
