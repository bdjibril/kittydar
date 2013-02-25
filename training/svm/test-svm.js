var fs = require("fs"),
    path = require("path"),
    nomnom = require("nomnom"),
    features = require("../../features"),
    utils = require("../../utils"),
    svm = require("svm"),
    collect = require("../collect");

var opts = nomnom.options({
  posDir: {
    position: 0,
    default: __dirname + "/collection/POSITIVES_TEST/",
    help: "Directory of test positives"
  },
  negDir: {
    position: 1,
    default: __dirname + "/collection/NEGATIVES_TEST/",
    help: "Directory of test negatives"
  },
  jsonFile: {
    default: __dirname + "/svm.json",
    help: "SVM JSON file"
  },
  sample: {
    flag: true,
    help: "sub-sample the negative images"
  }
}).colors().parse();

testSVM();


function testSVM() {
  var json = require(opts.jsonFile)

  var SVM = new svm.SVM();
  SVM.fromJSON(json);

  var data = collect.collectData(opts.posDir, opts.negDir, opts.sample ? 1 : 0);

  console.time("TEST")
  var truePos = 0, trueNeg = 0, falsePos = 0, falseNeg = 0;
  for (var i = 0; i < data.length; i++) {
    var output = data[i].output[0];
        input = data[i].input;
    var result = SVM.predict([input])[0];

    if (result == 1 && output == 1) {
      truePos++;
    }
    else if (result == -1 && output == 0) {
      trueNeg++;
    }
    else if (result == 1 && output == 0) {
      falsePos++;
    }
    else if (result == -1 && output == 1) {
      falseNeg++;
    }
  }
  console.timeEnd("TEST");

  console.log("precision: " + truePos / (truePos + falsePos))
  console.log("recall:    " + truePos / (truePos + falseNeg))

  console.log(truePos + " true positives");
  console.log(trueNeg + " true negatives");
  console.log(falsePos + " false positives");
  console.log(falseNeg + " false negatives");
  console.log(data.length + " total");
}


function testNetwork() {
  var data = collect.collectData(opts.posDir, opts.negDir, opts.sample ? 1 : 0);
  console.log("testing on", data.length);

  console.log("feature size", data[0].input.length);

  var json = require(opts.network)
  var network = new brain.NeuralNetwork().fromJSON(json);
  var stats = network.test(data);

  console.log("error:     " + stats.error);
  console.log("precision: " + stats.precision)
  console.log("recall:    " + stats.recall)
  console.log("accuracy:  " + stats.accuracy)

  console.log(stats.truePos + " true positives");
  console.log(stats.trueNeg + " true negatives");
  console.log(stats.falsePos + " false positives");
  console.log(stats.falseNeg + " false negatives");
  console.log(stats.total + " total");
}
