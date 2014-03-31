# CSS Shapes Editor

JavaScript component for editing CSS Shapes like polygon(), circle(), ellipse() and rectangle() right in the browser.

## Usage

Load the `CSSShapesEditor.js` file into the page

    <srcipt src="dist/CSSShapesEditor.js"></srcipt>

Setup the editor on an element to edit a CSS shape value

    var element = document.querySelector('#content');
    var shape = window.getComputedStyle(element)['shape-inside'];
    var editor = CSSShapesEditor(element, shape);

An editor appropriate for the shape will be drawn on top of the element. Supported shapes are: `polygon()`, `circle()`, `ellipse()` and `rectangle()`;

Create a new shape from scratch passing a shape delcaration with no coordinates.

    var editor = CSSShapesEditor(element, 'polygon()');

Live update the CSS shape on the element by reacting to `shapechange` events.

    editor.on('shapechange', function(){
      element.style['shape-inside'] = editor.getCSSValue();
    })

Turn off editor and remove if from the page. **Unsaved changes will be lost.**

    editor.remove()
    
__TODO: add detailed API docs explaining methods and events__

__TODO: add basic example__

## Contributing

Edit source in the `src/` directory. Add tests to `test/spec/`. Build output goes into `dist/`. Do not edit souce in `dist/`, it gets replaced automatically by the Grunt build process.

Requirements:

  - [node.js](http://nodejs.org/)
  - [Grunt](http://gruntjs.com/)

### Setup dev environment

Install dependencies

    npm install

### Test

__TODO: add test task in Gruntfile__

If using [testem](https://github.com/airportyh/testem) for continous integration testing run:

    testem

### Build

    grunt build

Collects all dependencies builds them into a sigle file output in `dist/`