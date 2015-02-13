# About this project

This is a simple mashup example that uses [Node.js](http://nodejs.org/). It
insults the user with phrases fetched from
[FOAAS](http://foaas.herokuapp.com/), signed by the Swedish namesday name for a
given date, or today's date, should no date be given. The name is fetched from
[Svenska Dagar](http://api.dryg.net/).

The data is presented as a simple web page in a calm font, or, if fed the
header *Accept: application/json* as a JSON response.

# How do I build this project?

Being written in Javascript, there is no real building involved. However, you
will need to manage the project's dependencies. For this, you need to have
Node.js and [npm](https://www.npmjs.com) installed. Once installed, you can let
npm download all module dependencies by navigating to your project folder from
a terminal and type

    npm install

# How do I run this project?

Running a Node.js program is really simple. Open a terminal, navigate to your
project folder and type

    node bin/www
    
As the *bin/www* file is in fact a shell script written in Javascript,
declaring *node* as its interpreter, you may also simply type
    
    bin/www

You should now be up and running. The program runs at port 3000 by default. You
can try it by trying to access *localhost:3000/insult*.

# The API

The API exposes two endpoints:

### /insult

Using this endpoint, you'll be insulted by today's Swedish namesday name. By
calling the endpoint with the *Accept: application/json* header, you'll be fed
a JSON response formed as

    {
        "message": string,
        "from": string
    }

### /insult/year/month/day

Using this endpoint, you'll be insulted by the specified date's Swedish
namesday name. By calling the endpoint with the *Accept: application/json*
header, you'll be fed a JSON response formed as

    {
        "message": string,
        "from": string
    }

The year is given as four digits, the month and day as two digits respectively.
As an example, calling my birthday (*localhost:3000/insult/1981/06/16*) will
return an insult by Axel (who, I presume, is no less than @axelolsson).