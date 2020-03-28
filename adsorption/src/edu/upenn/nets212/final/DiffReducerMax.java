package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class DiffReducerMax extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		// second step of diff stage, to find max diff
		double maxDistance = 0;
		System.out.println("\n\n\nDIFF REDUCER MAX");

		for (Text value : values) {
			double currVal = Double.parseDouble(value.toString());
			System.out.println("Value:" + currVal);
			if (maxDistance < currVal) {
				System.out.println("updated maxDistance");
				maxDistance = currVal;
			}
		}
		System.out.println("Final maxDistance:" + maxDistance);
		context.write(new Text(Double.toString(maxDistance)), new Text());
	}
}
