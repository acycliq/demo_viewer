var markersLength = 100000;
var zoomChangeTs = null;

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

var easing = BezierEasing(0, 0, 0.25, 1);

function drawPoints(textures, focusTextures, markers) {
    var firstDraw = true;
    var prevZoom;
    var markerSprites = [];
    var colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(["#c6233c", "#ffd300", "#008000"]);

    var frame = null;
    var focus = null;
    var pixiContainer = new PIXI.ParticleContainer(400000, {vertices: true});
    var tint = d3.color(colorScale(Math.random() * 100)).rgb();
    pixiContainer.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return L.pixiOverlay(function (utils) {
        var zoom = utils.getMap().getZoom();
        var container = utils.getContainer();
        var renderer = utils.getRenderer();
        var project = utils.latLngToLayerPoint;
        var scale = utils.getScale();
        var invScale = 1 / scale;
        if (firstDraw) {
            prevZoom = zoom;
            markers.forEach(function (marker) {
                var coords = project([marker.latitude, marker.longitude]);
                var markerSprite = new PIXI.Sprite(textures[2]);
                markerSprite.x = coords.x;
                markerSprite.y = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
                markerSprite.legend = marker.city || marker.label;
            });
        }
        if (firstDraw || prevZoom !== zoom) {
            markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(invScale / 2);
            });
        }
        firstDraw = false;
        prevZoom = zoom;
        renderer.render(container);
    }, pixiContainer, {
        doubleBuffering: true
    });
}


function renderCircleMarkers(innerContainer) {
    return function (utils, event) {
        var zoom = utils.getMap().getZoom();
        var container = utils.getContainer();
        var renderer = utils.getRenderer();
        var project = utils.latLngToLayerPoint;
        var getScale = utils.getScale;
        var invScale = 1 / getScale();

        if (event.type === 'add') {
            var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
            innerContainer.x = origin.x;
            innerContainer.y = origin.y;
            initialScale = invScale / 8;
            innerContainer.localScale = initialScale;
            for (var i = 0; i < markersLength; i++) {
                var coords = project([getRandom(0, 190000), getRandom(0, 190000)]);
                // our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
                innerContainer.addChild({
                    x: coords.x - origin.x,
                    y: coords.y - origin.y
                });
            }
        }

        if (event.type === 'zoomanim') {
            var targetZoom = event.zoom;
            if (targetZoom >= 7 || zoom >= 7) {
                zoomChangeTs = 0;
                var targetScale = targetZoom >= 7 ? 1 / (getScale(event.zoom) ^ 2) : initialScale;
                innerContainer.currentScale = innerContainer.localScale;
                innerContainer.targetScale = targetScale;
            }
            return;
        }

        if (event.type === 'redraw') {
            var delta = event.delta;
            if (zoomChangeTs !== null) {
                var duration = 17;
                zoomChangeTs += delta;
                var lambda = zoomChangeTs / duration;
                if (lambda > 1) {
                    lambda = 1;
                    zoomChangeTs = null;
                }
                lambda = easing(lambda);
                innerContainer.localScale = innerContainer.currentScale + lambda * (innerContainer.targetScale - innerContainer.currentScale);
            } else {
                return;
            }
        }

        renderer.render(container);
    }
}