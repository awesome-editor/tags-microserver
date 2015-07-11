#ssa-recommendation-engine

This uses an algorithm based on the paper, ["An Intelligent System for Semi-Automatic Evolution of
Ontologies"](http://josquin.cs.depaul.edu/~mramezani/papers/IEEEIS.pdf), to auto-magically recommend
parent categories for a given tag from a pre-existing structured hierarchy.

In plain English, one use case for this algorithm is:

Given: an existing hierarchy

1. another algorithm (for example,
  [text-rank](https://github.com/frankandrobot/text-rank)) generates tags for a newly added
  document (tag cloud).
2. `ssa-recommendation-engine` recommends parent categories (or tags) from the existing
  hierarchy for the new tags. Unclassified tags become parent categories.

In other words, the engine helps classify a document in an existing tag hierarchy and
help grow the hierarchy

# Limitations

The algorithm is best suited for single-user systems because the running time is proportional to
the total number of categories.

# Usage

    $ npm install

If you want to run the tests, you probably also want to globally install jasmine.

    $ npm intall -g jasmine-node

Then

    var ssa = require('ssa-recommendation-engine');

    var suggestions = ssa.SSAp(args);

where `args` is:

       var args = {

          target: //the target tag
          sim: //similarity measure (explained below)
          SSA: //SSA function (explained below)
          categories: //a list of existing categories

          parameters: {
            k: //the paper recommends k=3 in the real world (explained below),
            threshold: //cutoff for a good recommendation (from 0 to 1)
          }

          //optional
          nearestneighbors = //the k-nearest categories of the target under the similarity measure
                             //if undefined, it will automatically find these
        }

A **similarity measure** tries to measure how similar two objects are. The larger the similarity
value, the "closer" the two objects are. Please take a look at
[string metrics over in Wikipedia](http://en.wikipedia.org/wiki/String_metric) for
examples of text similarity measures.. We suggest `most-frequent-k-chars`.

An **SSA function** describes the hierarchy of the categories. It is the inverse of the distance
of a category to one of its ancestors; 0 otherwise. More precisely:

    SSA(ancestor, descendant) =
      if (ancestor === descendant)
          return 1
      else if (ancestor is an ancestor of descendant)
          return 1 / (the directed distance of descendant to the ancestor)
      else return 0

Example: The "categories" are the numbers [0,1,2,3,4,5].
The hierarchy is:

    (0) -> (1) -> (2)
    (0) -> (3)
    (4) -> (5)

Then

    SSA(0, 0) = 1     SSA(0, 3) = 1   SSA(3, 0) = 0     etc.
    SSA(0, 1) = 1     SSA(4, 5) = 1   SSA(5, 2) = 0
    SSA(0, 2) = 1/2                   SSA(5, 4) = 0

The algorithm works by first finding the k-nearest neighbors of the `target` among the category
list. Then it scores each neighbor with a number between 0 and 1. Neighbors with a scores above
the `threshold` are said to be "good" possible parent categories.

Note: the paper recommends to use k = 3 for real-world use cases.

# Example

Example: Say the "target" is the number 0, "categories" are the numbers [0,1,2,3,4,5], k = 2, and
the threshold is 0 (this makes all suggestions "good"), and the hierarchy is:

    (0) -> (1) -> (2)
    (0) -> (3)
    (4) -> (5)

Then the SSA values can be described by a matrix:

    var SSA = {
         //0   1   2     3   4   5
       0: [1,  1,  1/2   1,  0,  0],
       1: [0,  1,  1,    0,  0,  0],
       2: [0,  0,  1,    0,  0,  0],
       3: [0,  0,  0,    1,  0,  0],
       4: [0,  0,  0,    0,  1,  1],
       5: [0,  0,  0,    0,  0,  1]
    };

If it's not clear, `SSA[x,y]` gives the SSA distance from x to y. (So SSA[0,1] = 1, ...)

(Note that you probably do *not* want to use a matrix representation in the real-world because the
matrix is sparse.)

For "similarity", we can use the absolute distance (so two numbers are more similar if they are
farther away):

    var sim = function(x,y) { return Math.abs(x-y); };

Then

    var suggestions = ssa.SSAp({

        parameters: { k:2, threshold: 0 },

        target: 0,
        sim: sim,
        SSA: SSA,
        categories: [0,1,2,3,4,5]

    }; //returns the suggested parent categories for "0"

# Real-World Example
I'm currently using the `neo4j` graph database to store tags and tag relationships (the hierarchy structure). It's a really good fit for this problem. 

The downside is that the nodejs driver is an HTTP RESTful call. That means multiple calls to find the SSA will be super slow. 

As a result, I'm taking the following approach:

+ fetch all tags (in one HTTP db call)
+ find the nearest neighbors of the target(s) (using `#findKNearestNeighbors`)
+ fetch the SSA of the nearest neighbors and all tags (in one HTTP db call). If you look under the hood, you need only the following SSA values:

      SSA(n,t) for every n that is one of the nearest neighbors
      and every t that is a tag

+ pass the above values to `#SSAp`.
      

# Credits

- ["An Intelligent System for Semi-Automatic Evolution of
  Ontologies"](http://josquin.cs.depaul.edu/~mramezani/papers/IEEEIS.pdf)
