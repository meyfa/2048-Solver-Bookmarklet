# 2048 Solver Bookmarklet

The code in this repository is the implementation of a heuristic algorithm
that automates winning Gabriele Cirulli's game
[2048](https://gabrielecirulli.github.io/2048/).

It does so by recursively analyzing the tree of possible moves given the
current board, selecting the move where a certain heuristic score turns out
maximal. The heuristic favors fewer tiles, monotone rows and columns, and having
higher values near the corners instead of the center.

This implementation is not a fork of the original game code; instead it runs as
a Bookmarklet, which means the code is injected into the page in real-time.
It features a basic UI for starting and stopping execution.

## Usage

Visit http://meyfa.net/projects/2048-solver-bookmarklet for the bookmarkable
script link and usage guidelines.

## Building

Building this project requires [Node](https://nodejs.org) to be installed.
Moreover, you need to have Gulp (`npm install -g gulp`).

After cloning this repository, run `npm install` to set up its dependencies.
Then it can be compiled (built) by running `gulp`, after which the `target`
directory will contain the minified loader as well as the minified solver
script.

## Tests

The unit tests in this project use Mocha's web interface. First, build this
project. Then, open `test/index.html` in your favorite browser. The tests should
start running automatically.
