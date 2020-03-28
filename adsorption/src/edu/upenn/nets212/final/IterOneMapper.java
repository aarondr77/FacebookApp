package edu.upenn.nets212.hw3;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.Mapper.Context;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class IterOneMapper extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		System.out.println("\n\n\nRUNNING ITER ONE");

		String node = AdsorptionDriver.getNode(value.toString());
		String str = value.toString();
		System.out.println("Node:" + node);
		System.out.println("Str:" + str + "");
		context.write(new Text(node), new Text(str));

		// Write a 1.0 to yourself
		String toSendSelf = AdsorptionDriver.makeIntermString(node, node, "1.0");
		context.write(new Text(node), new Text(toSendSelf));


		String[] adj = AdsorptionDriver.getAdjArr(str);
		String[] weights = AdsorptionDriver.getWeightArr(str);
		for (String adjNode : adj) {
			for (String labelWeight : weights) {
				if (labelWeight.replaceAll("\\s", "").equals("")) continue;
				System.out.println("Label:"  + labelWeight);
				String label = labelWeight.split(",")[0];
				Double weight = Double.parseDouble(labelWeight.split(",")[1]) / (double) adj.length;
				String toSend = AdsorptionDriver.makeIntermString(adjNode, label, weight + "");
				System.out.println("\n Outputting valid:" + toSend);
				context.write(new Text(label), new Text(toSend));
			}
		}
	}
}
