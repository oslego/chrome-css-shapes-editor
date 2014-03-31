/*global require, jasmine */
require.config({
    // set baseUrl to src/
    baseUrl: '../src/',
    paths: {
        'jquery': 'third-party/jquery/jquery.min',
        'text': 'third-party/requirejs/text',
        'eve': 'third-party/eve/eve',
        'snap': 'third-party/snap/snap.svg-min',
        'snap.plugins': 'third-party/snap.plugins/snap.plugins',
        'snap.freeTransform': 'third-party/snap.freetransform/snap.freetransform',
        'spec': '../test/spec',
        'lodash': 'third-party/lodash/lodash'
    }
});
require([
    'text',
    'spec/CSSShapesEditorSpec',
    'spec/PolygonEditorSpec',
    'spec/CircleEditorSpec',
    'spec/EllipseEditorSpec',
    'spec/RectangleEditorSpec',
    'spec/CSSUtilsSpec'
], function(){
    'use strict';
    var env = jasmine.getEnv();
    env.addReporter(new jasmine.HtmlReporter());
    env.execute();
});
