# Dynamic Script Loader (Javascript)

This package imports and attaches (inline), the given external JavaScript and CSS resources.

Individual scripts that are imported can be tracked and some basic detection and error handling is also available.

Another usefull built in feature is the deferred queue chain. Any operation can be queued rather than be executed immediately. The queued script chain can then be executed with a commit statement, with retry and fail handlers built in.

## Getting Started

You can install the library from npm:

    npm install proto-js-loader --save-dev

## Example Usage

On the client, you can then do:

    // Simply define what you want loaded
    remoteScripts.define('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css');
    remoteScripts.define('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.js');
    
    // Inject styles and scripts directly into the document header
    remoteScripts.define([
      'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css',
      'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.js'
    ], null, function (url, info){ 
      console.log('Done:', url); 
    }, document.body);
    

## Motivation

This library was written because I needed a way to inject styles and javscript dynamically, with greater control over when a script load failed (or succeeded), and have a handy retry feature. 

## Tests

No tests have been set up for this project.

## Contributors

This library is provided "as-is" and totally free to use. No support comes with it. If you want to make a contribution or include a new feature, you can create a pull request. I will reserve the right to update this package as new requirements become available.   

## MIT License

Copyright (c) 2014-2015 JohnnyBeProgramming - http://www.prototyped.info

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
