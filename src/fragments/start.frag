(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.CSSShapesEditor = factory();
    }
}(this, function () {
