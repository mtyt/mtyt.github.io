---
layout: post
title:  "Lennonnet"
date:   2023-01
categories: python programming machine-learning pytorch
permalink: /lennonnet-post/
published: false
---

A few weeks ago, I started reading [The Alignment Problem][alignment-problem]
by Brian Christian. It's a very good book about the problem of aligning "AI" behavior with human values.
I don't explain it as well as he does, but basically it's about
what can go wrong when you don't pay attention when programming something that one might brand as artificial intelligence.

I am somewhat interested in machine-learning (ML) and AI but I feel (and I don't think I'm the only one)
that too many people think it's some kind of magic where computers
become alive. I suppose it all depends on your definition of alive.
I think part of this comes from the fact that even programmers of AI, especially in the case of Neural Networks (NN), don't really know what's going on inside the model that seems to be able to do a bunch of things better than us humans.
In a NN, what's basically happening is that you take some input data, in the form of a vector, and you multiply it with with some numbers (weigths), add some numbers (biases) and send it through some non-linear function.
You do this a number of times (a number of layers) and when this number is high, you call it a *deep* NN.
The output of the NN is the response of the model to the input.
For example, you send an image through the NN and the output is some label of what the image most probably is (cat, dog, bike, etc.).
By sending a whole lot of pre-labeled data through the NN and tweaking the weights and biases each time, you can *train* the network to classify those images.
It's a little bit like fitting a curve through some data points.
So in the end, you have a trained model, which can then do predictions. What's making it seem magical, I think, is that generally, we can't make much sense of what these weights and biases represent.
But in the end it's just simple mathematical functions.

So then I thought: if it's so simple, then I should be able to do it!

And I found it very interesting to do some experiments with ML in pytorch while reading the book, and noticing the same problems as described in the book.
My goal was to make a very simple image classification model, based on *Convolutional Neural Networks* (CNN), which could tell me whether an image was John Lennon, or not. Hence the name: Lennonnet.

I did a bit of reading online and it turns out you can just download CNNs and re-train them.
I combined this with some basic web-scraping, to provide my training data.
After the first training, the results were less than satisfactory. My model basically classified any person as John and everything else as Not John. The reason was probably that my training data contained a lot of pictures of John Lennon and a lot of pictures of random stuff, but not a lot of people.
So I suppose the NN just recognized if something was a person or not.
I guess every engineer knows the adage: "Garbage in, garbage out". I don't think that actually applies here, since I think my data was not garbage, it was just the wrong data.
In a second step, I added a lot of pictures of people to the Not John training data. That seemed to help.
Unfortunately, when I input a picture of Paul Mc Cartney into Lennonnet, it still classified it as John.
Perhaps they look a lot alike (especially in the first years of the Beatles, when they all had the same haircut.)
So then I added a bunch of pictures of the other Beatles in the Not John dataset.

I don't know if this is cheating. But I had some fun doing this and I learned a lot. At least my model seems to know that a potato is not John Lennon.

[alignment-problem]: https://wwww.google.com
[timm]
[pytorch]