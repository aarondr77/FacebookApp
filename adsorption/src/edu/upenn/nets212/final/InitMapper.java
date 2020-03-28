package edu.upenn.nets212.hw3;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.Mapper.Context;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class InitMapper extends Mapper<LongWritable, Text, Text, Text> {
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		// for each node, let reducer get edge (keeping edge ordered)
		String[] val = value.toString().split("\t");
		context.write(new Text(val[0]), new Text(val[1]));
	}
}
