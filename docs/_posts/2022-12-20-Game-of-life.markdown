---
layout: post
title:  "Game of Life"
date:   2022-12-20
categories: javascript games
permalink: /game-of-life-post/
---
[Conway's Game of Life][wiki]{:target="_blank"} is a famous game which requires only little user interaction
but is fascinating to look at and allows for rabbit-hole-style wasting time on the internet. Perfect!

I thought it would be a good way to develop my JavaScript skills. From zero to more than zero.
So here it is: [futiledevices.be/game-of-life][game]{:target="_blank"}.

Turns out it's quite fun to play with the combination of HTML/CSS/JavaScript.
As a starting point, I used this [MDN tutorial for a simple game in JavaScript][mdn-tut]{:target="_blank"}.

I learned about things like Flexbox, where [this][flex-tut]{:target="_blank"} tutorial was quite helpful.
Using Flexbox, it becomes really easy to make a page that works well on a computer screen
as well as on a phone. I hope.

I also learned the hard way that you can't easily check if a particular array is inside an array.
In Python you would do something like:

    array = [[0,0], [0,1]]
    [0,0] in array
    >  True

But something similar doesn't work in JavaScript since it checks if the exact same object is in the array.
[So you have to write your own function that checks if all the elements of the array in the array are the same][array-so]{:target="_blank"}.

Anyhow, once you have the basic elements, then it's quite easily put together. I think I used all the different
ways I found online to do the same thing, but hey, if it works, it works.

Initially I had the source for the html and js in a separate repository on GitHub but in order
to integrate it into this site, I moved it to the [mtyt.github.io]{:target="_blank"} repository. If you'd like to
make your own improved version, you only need these three files and perhaps update the links between them:
- [game.html]{:target="_blank"}
- [game.css]{:target="_blank"}
- [game_of_life.js]{:target="_blank"}

E.g. in [game.html]{:target="_blank"} you'll find these lines:

    <head>
    <meta charset="utf-8" />
    <title>Game of Life</title>
    <link href="/styles/game.css" rel="stylesheet" type="text/css">
    </head>

And

    <script src="/scripts/game_of_life.js"></script>

So just make sure those point to the correct location.

For debugging, you can just use your browser! For Firefox, you can find the instructions [here][ff-debugger]{:target="_blank"}.
For other browsers, see [here][ff]{:target="_blank"}.

Here's a screenshot and if you click it, you go straight to the game!
[![Game of Life screenshot](/assets/img/game-of-life.png)](/game-of-life)

[wiki]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
[game]: /game-of-life
[flex-tut]: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
[mdn-tut]: https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
[mtyt.github.io]: https://github.com/mtyt/mtyt.github.io
[game.html]: https://github.com/mtyt/mtyt.github.io/blob/main/docs/_includes/game.html
[game.css]: https://github.com/mtyt/mtyt.github.io/blob/main/docs/styles/game.css
[game_of_life.js]: https://github.com/mtyt/mtyt.github.io/blob/main/docs/scripts/game_of_life.js
[ff-debugger]: https://firefox-source-docs.mozilla.org/devtools-user/debugger/how_to/open_the_debugger/index.html
[ff]: https://www.mozilla.org/en-US/firefox/new/
[array-so]: https://stackoverflow.com/a/19543566/20528161