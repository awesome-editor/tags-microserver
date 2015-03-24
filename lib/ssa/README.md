#ssa-recommendation-engine

This uses an algorithm based on the paper, ["An Intelligent System for Semi-Automatic Evolution of
Ontologies"](http://josquin.cs.depaul.edu/~mramezani/papers/IEEEIS.pdf), to auto-magically recommend
parent categories for a given tag from a pre-existing structured hierarchy.

In plain English, one use case for this algorithm is:

1. a user manually creates a hierarchy.
2. as she adds new content, she or another algorithm (for example,
  [text-rank](https://github.com/frankandrobot/text-rank)), creates a tag cloud for the document.
3. `ssa-recommendation-engine` then recommends parent categories (or tags) for the new tags.
4. the user approves/rejects the suggestions and makes her own modifications to the hierarchy.
5. Repeat Steps 2-4.

In other words, the engine works *collaboratively* with humans.

# Limitations

The running time really sucks on large scale systems, say +1,000 categories. (The reason is
because the running time is proportional to the total number of categories. In other words,
the algorithm is limited to single-user systems.)

The algorithm makes no assumptions about where you store the tags and categories---in memory,
on a database, generated on the fly, etc. (Actually, now that I think about it,
this isn't really a limitation.)

# Usage

    $ npm install

If you want to run the tests, you probably also want to globally install jasmine.

    $ npm intall -g jasmine-node

Then

    var ssa = require('ssa-recommendation-engine');

    var suggestions = ssa.SSAp(args);

where `args` is:

       var args = {

          target: //the tag to find parent categories
          sim: //similarity measure
          SSA: //SSA function (explained below)
          categories: //a list of categories

          parameters: {
            k: //the paper recommends k=3 in the real world (explained below),
            threshold: //cutoff for a good recommendation (from 0 to 1)
          }

          //optional
          nearestneighbors = //the k-nearest categories of the target under the similarity measure
                             //if undefined, it will automatically find these
        }

A similarity is a measure of distance...sort of. The larger the similarity value, the "closer"
two objects are. It tries to measure how similar two objects are. Because the main use case is text,
you probably want to take a look at
[string metrics over in Wikipedia](http://en.wikipedia.org/wiki/String_metric).

The SSA function describes the hierarchy of the categories. It is the inverse of the distance (in
the hierarchy) of a category to one of its ancestors; 0 otherwise. More precisely:

    SSA(ancestor, descendant) =
      if (ancestor === descendant)
          return 1
      else if (ancestor is an ancestor of descendant)
          return 1 / (the directed distance of descendant to the ancestor)
      else return 0

Example: Say the "categories" are the numbers [0,1,2,3,4,5],
and the hierarchy is:

    (0) -> (1) -> (2)
    (0) -> (3)
    (4) -> (5)

Then

    SSA(0, 0) = 1     SSA(0, 3) = 1   SSA(3, 0) = 0     etc.
    SSA(0, 1) = 1     SSA(4, 5) = 1   SSA(5, 2) = 0
    SSA(0, 2) = 1/2                   SSA(5, 4) = 0

The algorithm works by first finding the k-nearest neighbors of the `target` in the list of
categories. Then it uses these neighbors to help recommend categories. More precisely,
the algorithm returns a number between 0 and 1. The `threshold` is an arbitrary cut-off value for
 "good" suggestions.

Note: the paper recommends to use k = 3 for real-world use cases.

# Example

Example: Say the "target" is the number 0, "categories" are the numbers [0,1,2,3,4,5], k = 2, and
the threshold is 0 (this makes all suggestions "good"), and the hierarchy is:

    (0) -> (1) -> (2)
    (0) -> (3)
    (4) -> (5)

Then we can describe SSA by a matrix:

    var SSA = {
         //0   1   2     3   4   5
       0: [1,  1,  1/2   1,  0,  0],
       1: [0,  1,  1,    0,  0,  0],
       2: [0,  0,  1,    0,  0,  0],
       3: [0,  0,  0,    1,  0,  0],
       4: [0,  0,  0,    0,  1,  1],
       5: [0,  0,  0,    0,  0,  1]
    };

If it's not clear, `SSA[x,y]` gives exactly the same values as computed before.
(Note that you probably do not want to use a matrix representation in the real-world because the
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
