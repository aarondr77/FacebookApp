package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;
import java.util.HashMap;

public class DiffReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		System.out.println("\n\n\n RUNNING DIFF FOR:" + key.toString());
		// first step of diff, finding different between first and last values
		String[] weightList = new String[2];
		int i = 0;
		for (Text value : values) {
			weightList[i] = value.toString();
			System.out.println("Weightlist:" + weightList[i]);
			i++;
		}

		HashMap<String, Double> weights = new HashMap<String, Double>();

		String[] parsedWeightZero = weightList[0].split(";");
		for (String labelWeight : parsedWeightZero) {
			if (labelWeight.replaceAll("\\s", "").equals("")) continue;
			String label = labelWeight.split(",")[0];
			double weight = Double.parseDouble(labelWeight.split(",")[1]);

			weights.put(label, weight);
		}

		double maxDiff = 0;
		String[] parsedWeightOne = weightList[1].split(";");
		for (String labelWeight : parsedWeightOne) {
			if (labelWeight.replaceAll("\\s", "").equals("")) continue;
			String label = labelWeight.split(",")[0];
			double weight = Double.parseDouble(labelWeight.split(",")[1]);

			if (!weights.containsKey(label)) {
				System.out.print("NEW KEY");
				context.write(new Text(Double.toString(100000.0)), new Text());
				return;
			} else {
				double diff = Math.abs(weight - weights.get(label));
				if (diff > maxDiff) {
					System.out.print("\n\n\n Updating diff");
					maxDiff = diff;
				}
			}
		}

		context.write(new Text(Double.toString(maxDiff)), new Text());
	}
}
