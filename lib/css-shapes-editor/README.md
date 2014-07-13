# CSS Shapes Editor

JavaScript library for interactive editing of CSS Shapes values right in the browser. It works functional values like `polygon()`, `circle()` and `ellipse()`.

## Demo

See the `demo/` folder for examples.

## Basic usage

Load `dist/CSSShapesEditor.js` into the page:

```js
<script src="dist/CSSShapesEditor.js"></script>
```

Setup the editor to edit a CSS shape value of an element. An interactive editor for the shape is drawn on top of the element.

```js
var element = document.querySelector('#element');
var shape = window.getComputedStyle(element)['shape-outside'];
var editor = CSSShapesEditor(element, shape);

editor.on('shapechange', function(){
  // update the CSS shape value on the element
  element.style['shape-outside'] = editor.getCSSValue();
})
```


Supported shape values:

 - `polygon()`
 - `circle()`
 - `ellipse()`

Create a new shape from scratch by passing a shape declaration with no coordinates.

```js
var editor = CSSShapesEditor(element, 'polygon()');
```

## Events

The `"ready"` event is dispatched after the editor was initialized

```js
editor.on('ready', function(){
  // editor is ready to work with
})
```

The `"shapechange"` event is dispatched after the shape was changed in the editor

```js
editor.on('shapechange', function(){
  // update the CSS shape value on the element
  element.style['shape-outside'] = editor.getCSSValue();
})
```

The `"removed"` event is dispatched after the editor has been turned off and removed by using `editor.remove()`.

```js
editor.on('removed', function(){
  // editor is gone; do other clean-up
})
```

## API  

Get the CSS shape value as a string to use in a stylesheet:

```js
editor.getCSSValue()
```

Programmatically update the shape editor with a new shape value:

```js
editor.update("circle(50% at center)")
```

Toggle the free-transform editor (scale, move, rotate) for the shape:

```js
editor.toggleFreeTransform();
```

Turn off editor and remove if from the page. **Unsaved changes will be lost.**

```js
editor.remove()
```

## Contributing

Your system needs:

  - [Node.JS](http://nodejs.org/)
  - [Grunt](http://gruntjs.com/)

### Setup dev environment

Install dependencies:

    $ npm install

### Build

Edit source in the `src/` directory. Build with Grunt:

    $ grunt build

Build output goes into `dist/`. Do not edit source in `dist/`, it gets replaced automatically by the Grunt build process.

### Test

Add tests to `test/spec/`. Run tests with [Testem](https://github.com/airportyh/testem):

    $ testem

Testem uses the configuration found in `testem.json`

## License

Apache 2.0. See [LICENSE.md](./LICENSE.md)

## Thanks

The work of many people has contributed, both directly and indirectly, to building the CSS Shapes Editor library:

- [Razvan Caliman](https://github.com/oslego)
- [Bear Travis](https://github.com/betravis)
- [Laurence Mclister](https://github.com/lmclister)
- [Hans Muller](https://github.com/hansmuller)
- [Lawrence Hsu](https://github.com/larz0)
- [Dmitry Baranovskiy](https://github.com/DmitryBaranovskiy) for creating [Snap.svg](http://snapsvg.io/)
- [Elbert Alias](https://github.com/elbertf) for creating [Raphael.FreeTransform ](https://github.com/ElbertF/Raphael.FreeTransform)

and many, many others. Thank you!
