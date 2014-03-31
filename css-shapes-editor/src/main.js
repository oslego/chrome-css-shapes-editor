/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, require */

require.config({
    // baseUrl: './', // infered from data-main on <script>
    paths: {
        'eve': 'third-party/eve/eve',
        'lodash': 'third-party/lodash/lodash',
        'snap': 'third-party/snap/snap.svg-min',
        'snap.plugins': 'third-party/snap.plugins/snap.plugins',
        'snap.freeTransform': 'third-party/snap.freetransform/snap.freetransform'
    }
});

define('main', ['CSSShapesEditor'], function(editor){
    'use strict';
    return editor;
});