## CSS Shapes Editor for Chrome DevTools

Chrome DevTools extension for live on-screen editing of CSS Shapes property values.

### How to install

 First, clone this repository:

   ```
   git clone git@github.com:oslego/chrome-css-shapes-editor.git
   ```
 Then, open Google Chrome (min version 37, check `chrome://version/`)
   - Navigate to `chrome://extensions`
   - Toggle on "Developer mode" checkbox
   - Click "Load unpacked extension"
   - Select the cloned repository folder


### How to use

- Launch DevTools (_View > Develop > Developer Tools_)
- Switch to _Elements_ panel
- Look for the new _Shapes_ sidebar next to _Styles_, _Event Listeners_, etc.
- In the _Shapes_ sidebar:
  - click "create" and select a shape type to add
    - an interactive editor appears on top of the selected element
  - click "edit" to turn on editor and adjust an existing shape
  - click "edit" again to remove the editor


### Known limitations

- Manually editing code in the _Shapes_ sidebar, like in _Styles_, is not yet available.
- There is no interactive editor for `inset()` shape function. Only `polygon()`, `circle()` and `ellipse()` are supported.
