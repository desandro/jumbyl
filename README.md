# jumbyl

Post to Tumblr with static files, like [Jekyll](http://github.com/mojombo/jekyll)

## Install

``` bash
npm install jumbyl -g
```

Jumbyl is a command-line tool. Installing it globally will add the `jumbyl` command.

## Setup

+ Go to [**www.tumblr.com/oauth/apps**](http://www.tumblr.com/oauth/apps)
+ Click **+ Register application**

Use these values for the jumbyl application. You can leave all the others blank.

<table>
  <tr><th>Application Name:</th><td>jumbyl</td></tr>
  <tr><th>Default callback URL:</th><td>http://localhost:8080/complete</td></tr>
</table>

Once you **Save changes**, copy the **OAuth consumer key** and **OAuth consumer secret** into `_jumbyl.yml`.

``` yaml
# these keys will not work, copy/paste in your own
baseHostname: your_blog.tumblr.com
consumerKey: UveNAMmenYF1Zivd6ahUJWKNy2gHl6PC9lMthT7mwjT8Ujf2NV
consumerSecret: dLfg7DB2ZU5eVx3xyL3DltxtOBchmvQReBIn9HYB3GmXsgYLaQ
```

``` bash
jumbyl auth
```

if there is a `.gitignore`, jumbyl will add `_jumbyl.yml` to it.

## Usage

``` bash
jumbyl my-post.md
```

Posts with ids with be used to edit

After successfully posting, jumbyl will add the tumblr post id to the file's YAML Front Matter.

## Options

Options for your post can be set with YAML Front Matter.

Additionally, the format of the post will be read from the post's file extention. I.E. Posts that use `.markdown` `.md` `.mkdn` `.mdown`, will be set as `format: 'markdown'`.
