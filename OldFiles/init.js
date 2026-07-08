Object.assign(window, NEATJavaScript);

// Create a new instance of Config
const config = new Config({
  // Basic network structure
  inputSize: 29,                    // Number of input nodes
  outputSize: 5,                   // Number of output nodes
  
  // Activation function (string-based selection)
  activationFunction: 'Sigmoid',   // Options: 'Sigmoid', 'NEATSigmoid', 'Tanh', 'ReLU', 'LeakyReLU', 'Gaussian'
  
  // Evolution parameters
  populationSize: 500,             // Size of the population
  generations: 100,                // Number of generations
  targetFitness: 0.95,             // Target fitness to achieve
  survivalRate: 0.2,               // Proportion that survives each generation
  numOfElite: 10,                  // Number of elite individuals to retain
  dropOffAge: 15,                  // Maximum age before dropping off
});

// Create a new population with your configuration
let population = new Population(config);

