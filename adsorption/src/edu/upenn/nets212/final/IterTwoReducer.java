package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;
import java.util.HashMap;
import java.util.Map;
import java.util.Iterator;


public class IterTwoReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		System.out.println("\n\n\nRUNNING ITER TWO REDUce" );
		String adj = null;

		HashMap<String, Double> weights = new HashMap<String, Double>();

		for (Text value: values) {
			System.out.println("Value: " + value.toString()  );
			String str = value.toString();

			if (AdsorptionDriver.isInterm(str)) {
				String label = AdsorptionDriver.getIntermLabel(str);
				double weight = AdsorptionDriver.getIntermWeight(str);
				if (weights.containsKey(label)) {
					weights.put(label, weights.get(label) + weight);
				} else {
					weights.put(label, weight);
				}
			} else {
				adj = AdsorptionDriver.getAdj(str);
			}
		}

		StringBuilder weightString = new StringBuilder();
		Iterator it = weights.entrySet().iterator();
    while (it.hasNext()) {
        Map.Entry pair = (Map.Entry)it.next();
				weightString.append(AdsorptionDriver.makeWeight((String) pair.getKey(), (double) pair.getValue()) + ";");
        it.remove();
    }

		String newStr = AdsorptionDriver.makeString(key.toString(), adj, weightString.toString());

		context.write(new Text(newStr), new Text());
	}
}
