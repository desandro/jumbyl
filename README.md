# jumbyl

Post to Tumblr with static files, like [Jekyll](http://github.com/mojombo/jekyll)

## Install

``` bash
npm install jumbyl
```

## Setup

### Register a Tumblr App

+ Go to [www.tumblr.com/oauth/apps](http://www.tumblr.com/oauth/apps)
+ Click + Register application

Use these values for the jumbyl application. You can leave all the others blank.

<table>
  <tr><th>Application Name:</th><td>jumbyl</td></tr>
  <tr><th>Default callback URL:</th><td>http://localhost:8080/complete</td></tr>
</table>

Once you **Save changes**, copy the **OAuth consumer key** and **OAuth consumer secret** into `_tumblr-oath.yml`.

``` yaml
consumer_key: UveNAMmenYF1Zivd6ahUJWKNy2gHl6PC9lMthT7mwjT8Ujf2NV
consumer_secret: dLfg7DB2ZU5eVx3xyL3DltxtOBchmvQReBIn9HYB3GmXsgYLaQ
```

``` bash
jumbyl auth
```

if there is a `.gitignore`, jumbyl will add `_tumblr-oath.yml` to it.

## Usage

``` bash
jumbyl my-post.md
```

## Options

Read format from filetype


Options for your post can be set with YAML Front Matter