package edu.upenn.nets212.hw3;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.Mapper.Context;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class DiffMapperMax extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		// send all values to one key - just to find max
		System.out.println("\n\n\nRunning DiffMapperMax:" + value.toString());
		context.write(new Text(), new Text(value.toString()));
	}
}
