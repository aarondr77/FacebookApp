package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;


public class FinishReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		for (Text value : values) {
			String[] weights = value.toString().split(";");
			for (String labelWeight : weights) {
				if (labelWeight.replaceAll("\\s", "").equals("")) continue;
				String label = labelWeight.split(",")[0];
				String weight = labelWeight.split(",")[1];
				context.write(new Text(key.toString()), new Text(label + "\t" + weight));

			}


		}
	}
}
