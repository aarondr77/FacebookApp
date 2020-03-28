package edu.upenn.nets212.hw3;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.Mapper.Context;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class DiffMapper extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		String str = value.toString();

		String node = AdsorptionDriver.getNode(str);
		String weights = AdsorptionDriver.getWeight(str);

		context.write(new Text(node), new Text(weights));
	}
}
