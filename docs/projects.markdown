---
layout: page
title: Projects
permalink: /projects/
---
# Optime
In a masters course project, I learned about genetic algorithms, and since then I've applied
them (using [DEAP]{:target="_blank"}) for optimization of electronic circuits. Now, I decided to implement my
own Python variant, since I only needed the basics. It's probably not very efficient, but it should
be fairly easy to use.

Find on GitHub: [optime]{:target="_blank"}

# Classevy
This Python package uses `optime` to divide a number of students into two or more classes,
based on user-defined criteria. More info can be found in this [post][classevy-post].

Find on GitHub: [classevy]{:target="_blank"}

# Recipes for the Planet
I created a Jupyter Notebook, available on [Google Colab][recipes]{:target="_blank"}, which uses `optime` to
find "recipes" that minimize your environmental footprint while satisfying your nutritional needs.
The original data comes from this article on Our World in Data:
[Environmental Impacts of Food Production][owid]{:target="_blank"}.
More info can be found in this [post][recipes-post].

Find on GitHub: [Recipes for the Planet][gh-nb]{:target="_blank"}

# Game of Life
A Conway's Game of Life implementation in JavaScript.
More info can be found in this [post](/game-of-life-post/).

Direct link to the game: [futiledevices.be/game-of-life][game]

[deap]: https://deap.readthedocs.io/en/master/
[optime]: https://github.com/mtyt/optime
[classevy]: https://github.com/mtyt/classevy
[classevy-post]: /classevy-post/
[recipes]: https://colab.research.google.com/github/mtyt/optime/blob/main/examples/Recipes_for_the_planet.ipynb
[owid]: https://ourworldindata.org/environmental-impacts-of-food
[gh-nb]: https://github.com/mtyt/optime/blob/main/examples/Recipes_for_the_planet.ipynb
[recipes-post]: /recipes-post/
[game]: /game-of-life
