---
layout: post
title:  "Cached property"
date:   2023-01-30
categories: python programming property
permalink: /cached-property-post/
published: true
---
In Python, the `@property` decorator is a very nice way to create functions that look like attributes that are computed based on other attributes. However, sometimes, this computation can be quite heavy and slow down the program, especially if you have a property that depends on a property that depends on a property etc and if you need it a lot!

That's where the `@cached_property` from `functools` comes in. This stores the property as an attribute and doesn't recompute it every time it is accessed. Of course sometimes we want it to be recomputed, for example when the value of an attribute on which it depends, changes. That problem can be solved by making a getter/setter for that attribute on which it depends.

If this sounds kind of abstract for you, I made it concrete with an example that you can
run on Google Colab without installing anything! Just some clicking:

[![colab-badge](https://colab.research.google.com/assets/colab-badge.svg){:width=120}][notebook]{:target="_blank"}

[notebook]: https://colab.research.google.com/github/mtyt/tutorials/blob/main/cached_property.ipynb