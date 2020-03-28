package edu.upenn.nets212.hw3;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;


import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;


public class AdsorptionDriver {
	public static void main(String[] args) throws Exception {
		System.out.println("Solution by: Nathan Rush (narush)");

		if (args.length == 0) {
			System.err.println("Improper usage!");
			System.exit(-1);
		} else if (args[0].equals("init")) {
			System.exit(runInit(args[1], args[2], args[3])? 0 : 1);
		} else if (args[0].equals("iter")) {
			System.exit(runIterTotal(args[1], args[2], args[3])? 0 : 1);
		} else if (args[0].equals("diff")) {
			System.exit(runDiffTotal(args[1], args[2], args[3], args[4])? 0 : 1);
		} else if (args[0].equals("finish")) {
			System.exit(runFinish(args[1], args[2], args[3])? 0 : 1);
		} else if (args[0].equals("composite")){
			String inputDir = args[1];
			String outputDir = args[2];
			String intermDir1 = args[3];
			String intermDir2 = args[4];
			String diffDir = args[5];
			String numReducers = args[6];
			runInit(inputDir, intermDir1, numReducers);
			double diff = 5; // start at arbitrary value > cutoff
			while (diff > .05) {
				runIterTotal(intermDir1, intermDir2, numReducers);
				runDiffTotal(intermDir1, intermDir2, diffDir, numReducers);
				deleteDirectory(intermDir1);
				// rename directory so less special cases
				renameDirectory(intermDir2, intermDir1);
				diff = readDiffResult(diffDir);
				System.out.println("\n\n\n\n\n DIFF:" + diff + "\n\n\n\n\n");
				deleteDirectory(diffDir);
			}
			runFinish(intermDir1, outputDir, numReducers);
			deleteDirectory(intermDir1);
		} else {
			System.err.println("Improper usage.");
			System.exit(-1);
		}
	 }


	// Runs both rouds of the diff - calculating and then finding max
	public static boolean runIterTotal(String intermDir1, String intermDir2, String numReducers) throws Exception {
		runIterOne(intermDir1, intermDir1 + "1", numReducers);
		runIterTwo(intermDir1 + "1", intermDir2, numReducers);
		deleteDirectory(intermDir1 + "1");
		return true;
	}

	// Runs both rouds of the diff - calculating and then finding max
	public static boolean runDiffTotal(String inputDir1, String inputDir2, String outputDir, String numReducers) throws Exception {
		runDiff(inputDir1, inputDir2, outputDir + "1", numReducers);
		runDiffMax(outputDir + "1", outputDir);
		deleteDirectory(outputDir + "1");
		return true;
	}

	// HELPER FUNCTIONS

	public static boolean runInit(String inputDir, String outputDir, String numReducers) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(InitMapper.class);
		job.setReducerClass(InitReducer.class);
		job.setOutputKeyClass(LongWritable.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(Integer.parseInt(numReducers));

		// Input/Output
		FileInputFormat.addInputPath(job, new Path(inputDir));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}

	public static boolean runIterOne(String inputDir, String outputDir, String numReducers) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(IterOneMapper.class);
		job.setReducerClass(IterOneReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(Integer.parseInt(numReducers));

		// Input/Output

		FileInputFormat.addInputPath(job, new Path(inputDir));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}

	public static boolean runIterTwo(String inputDir, String outputDir, String numReducers) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(IterTwoMapper.class);
		job.setReducerClass(IterTwoReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(Integer.parseInt(numReducers));

		// Input/Output

		FileInputFormat.addInputPath(job, new Path(inputDir));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}

	public static boolean runDiff(String inputDir1, String inputDir2, String outputDir, String numReducers) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(DiffMapper.class);
		job.setReducerClass(DiffReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(Integer.parseInt(numReducers));

		// Input/Output (we need mulitple input)
		FileInputFormat.addInputPath(job, new Path(inputDir1));
		FileInputFormat.addInputPath(job, new Path(inputDir2));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}

	public static boolean runDiffMax(String inputDir, String outputDir) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(DiffMapperMax.class);
		job.setReducerClass(DiffReducerMax.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(1);

		// Input/Output
		FileInputFormat.addInputPath(job, new Path(inputDir));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}

	public static boolean runFinish(String inputDir, String outputDir, String numReducers) throws IOException, ClassNotFoundException, InterruptedException {
		Job job = new Job();

		// Set classes
		job.setJarByClass(AdsorptionDriver.class);
		job.setMapperClass(FinishMapper.class);
		job.setReducerClass(FinishReducer.class);
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(Text.class);
		job.setMapOutputKeyClass(Text.class);
		job.setMapOutputValueClass(Text.class);
		job.setNumReduceTasks(Integer.parseInt(numReducers));

		// Input/Output

		FileInputFormat.addInputPath(job, new Path(inputDir));
		FileOutputFormat.setOutputPath(job, new Path(outputDir));

		return job.waitForCompletion(true);
	}


  // Given an output folder, returns the first double from the first part-r-00000 file
  static double readDiffResult(String path) throws Exception
  {
    double diffnum = 0.0;
    Path diffpath = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);

    if (fs.exists(diffpath)) {
      FileStatus[] ls = fs.listStatus(diffpath);
      for (FileStatus file : ls) {
	if (file.getPath().getName().startsWith("part-r-00000")) {
	  FSDataInputStream diffin = fs.open(file.getPath());
	  BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
	  String diffcontent = d.readLine();
	  diffnum = Double.parseDouble(diffcontent);
	  d.close();
	}
      }
    }

    fs.close();
    return diffnum;
  }

  static void deleteDirectory(String path) throws Exception {
    Path todelete = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);

    if (fs.exists(todelete))
      fs.delete(todelete, true);

    fs.close();
  }

  // Helper to reduce special cases with two intermediate folders
  static void renameDirectory(String path, String newName) throws Exception {
	    Path todelete = new Path(path);
	    Path newPath = new Path(newName);
	    Configuration conf = new Configuration();
	    FileSystem fs = FileSystem.get(URI.create(path),conf);

	    if (fs.exists(todelete))
	      fs.rename(todelete, newPath);

	    fs.close();
	  }

  // Helper functions for parsing and building strings


	static String makeString(String node, String adj, String weights) {
		return "node:" + node + "&adj:" + adj + "&weights:" + weights;
  }

	static String makeWeight(String node, double weight) {
		return node + "," + weight;
  }

	static String makeString(String node, String[] adj, String[] weights) {
		StringBuilder str = new StringBuilder("node:" + node + "&adj:");
		for (String a : adj) {
			str.append(adj + "\t");
		}
		str.append("&weights:");
		for (String w : weights) {
			str.append(w + "\t");
		}

		return str.toString();
  }

	static String getNode(String str) {
		return str.split("&")[0].split(":")[1];
  }

	static String getAdj(String str) {
		return str.split("&")[1].split(":")[1];
  }

	static String[] getAdjArr(String str) {
		return str.split("&")[1].split(":")[1].split(";");
  }

	static String getWeight(String str) {
		return str.split("&")[2].split(":")[1];
  }
	static String[] getWeightArr(String str) {
		return str.split("&")[2].split(":")[1].split(";");
  }

	// Interm

	static String makeIntermString(String to, String label, String weight) {
		return "to:" + to + "&label:" + label + "&weight:" + weight;
  }

	static boolean isInterm(String str) {
		return str.startsWith("to");
	}

	static String getIntermTo(String str) {
		return str.split("&")[0].split(":")[1];
	}

	static String getIntermLabel(String str) {
		return str.split("&")[1].split(":")[1];
	}

	static double getIntermWeight(String str) {
		return Double.parseDouble(str.split("&")[2].split(":")[1]);
	}
}
