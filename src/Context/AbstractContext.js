/*******************************************************************************
 * Copyright 2017 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of MIZAR.
 *
 * MIZAR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MIZAR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MIZAR. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
define(["jquery", "underscore-min", "../Utils/Event", "moment", "../Utils/Utils", "../Time/Time", "../Utils/UtilsIntersection", "../Layer/LayerFactory", "../Services/ServiceFactory", "../Utils/Constants",
        "../Registry/WMSServerRegistryHandler", "../Registry/WMTSServerRegistryHandler", "../Registry/WCSServerRegistryHandler", "../Registry/PendingLayersRegistryHandler", "../Registry/LayerRegistryHandler",
        "../Gui/Compass", "../Gui/Tracker/PositionTracker", "../Gui/Tracker/ElevationTracker", "../Utils/AttributionHandler", "../Gui/dialog/ErrorDialog",
        "../Renderer/PointRenderer", "../Renderer/LineStringRenderable", "../Renderer/PolygonRenderer", "../Renderer/LineRenderer",
        "../Renderer/PointSpriteRenderer", "../Renderer/ConvexPolygonRenderer"],
    function ($, _, Event, Moment, Utils, Time, UtilsIntersection, LayerFactory, ServiceFactory, Constants,
              WMSServerRegistryHandler, WMTSServerRegistryHandler, WCSServerRegistryHandler, PendingLayersRegistryHandler, LayerRegistryHandler,
              Compass, PositionTracker, ElevationTracker, AttributionHandler, ErrorDialog) {

        //TODO : attention de bien garder les ...Renderer dans le define

        /**
         * @name AbstractContext
         * @class
         * The active context object can normally be obtained from the {@link module:Context.ContextManager ContextManager}
         * class of the Mizar instance.<br/>
         * A context is the main webGL object that contains its own coordinate reference system,
         * its own data, its own navigation and its own GUI.<br/>
         * Client implementations should not normally instantiate this class directly.
         * @param {Mizar.configuration} mizarConfiguration - Mizar configuration
         * @param {CONTEXT} mode - the type of context
         * @param {AbstractContext.skyContext|AbstractContext.planetContext} ctxOptions - sky or planet options
         * @constructor
         * @implements {Context}
         * @listens Context#baseLayersReady
         */
        var AbstractContext = function (mizarConfiguration, mode, ctxOptions) {
            Event.prototype.constructor.call(this);
            var self = this;
            this.time = Time.parse(Moment().toISOString());
            this.globe = null;	// Sky or globe
            this.navigation = null;
            this.attributionHandler = null;
            this.components = {};
            this.dataProviders = {};
            this.canvas = mizarConfiguration.canvas;
            this.isMobile = ctxOptions.isMobile;

            // Link to time travel service
            this.timeTravelService = ctxOptions.timeTravelService;
            
            this.subscribe(Constants.EVENT_MSG.BASE_LAYERS_READY, function (imagery) {
                // When the background takes time to load, the viewMatrix computed by "computeViewMatrix" is created but
                // with empty values. Because of that, the globe cannot be displayed without moving the camera.
                // So we rerun "computeViewMatrix" once "baseLayersReady" is loaded to display the globe
                if (self.getNavigation().getRenderContext().viewMatrix[0] !== "undefined") {
                    self.getNavigation().computeViewMatrix();
                }
            });
            this.mizarConfiguration = mizarConfiguration.hasOwnProperty('configuration') ? mizarConfiguration.configuration : {};
            this.ctxOptions = ctxOptions;
            this.mode = mode;
            this.layers = [];
            this.pendingLayers = [];
            this.initCanvas(this.canvas);

            if (this.mizarConfiguration.positionTracker != null) {
                this.positionTracker = _createTrackerPosition.call(this, this.mizarConfiguration);
            }
            if (this.mizarConfiguration.elevationTracker != null) {
                this.elevationTracker = _createTrackerElevation.call(this, this.mizarConfiguration, ctxOptions);
            }

            this.compass = _createCompass.call(this, this.mizarConfiguration);

        };

        function _initComponentsVisibility(components) {
            // Show UI components depending on its state
            for (var componentId in components) {
                if(_isDivExist(componentId)) {
                    if (components[componentId]) {
                        $("#" + componentId).fadeIn(1000);
                    } else {
                        console.log("init: fadeout "+componentId);
                        $("#" + componentId).fadeOut();
                    }
                }
            }
        }

        function _isDivExist(divID) {
            return  $("#" + divID).length;
        }

        /**
         * Zoom to the selected layer.
         * @param layer - selected layer
         * @private
         */
        function _handleCameraWhenLayerAdded(layer) {
            if (layer.isVisible() && layer.getProperties() && !layer.isBackground() &&
                layer.getProperties().hasOwnProperty("initialRa") && layer.getProperties().hasOwnProperty("initialDec")) {
                var fov = (layer.getProperties().initialFov) ? layer.getProperties().initialFov : layer.getGlobe().getRenderContext().getFov();
                var navigation = layer.callbackContext.getNavigation();
                var center = navigation.getCenter();
                var globeType = layer.globe.getType();
                switch (globeType) {
                    case Constants.GLOBE.Sky:
                        navigation.zoomTo([layer.getProperties().initialRa, layer.getProperties().initialDec], {
                            fov: fov,
                            duration: 3000
                        });
                        break;
                    case Constants.GLOBE.Planet:
                        var bbox = layer.getProperties().bbox;
                        if (UtilsIntersection.isValueBetween(center[0], bbox[0], bbox[2]) && UtilsIntersection.isValueBetween(center[1], bbox[1], bbox[3])) {
                        } else {
                            var crs = layer.globe.getCoordinateSystem();
                            var planetRadius = crs.getGeoide().getRealPlanetRadius();
                            var distanceCamera = Utils.computeDistanceCameraFromBbox(bbox, fov, planetRadius, crs.isFlat());
                            navigation.zoomTo([layer.getProperties().initialRa, layer.getProperties().initialDec], {
                                distance: distanceCamera,
                                duration: 3000
                            });
                        }
                        break;
                    default:
                        throw new Error("type " + globeType + " is not implemented", "AbstractContext.js");
                }
            }
        }

        /**
         * Creates tracker position
         * @param {Mizar.configuration} mizarConfiguration
         * @returns {PositionTracker} positionTracker object
         * @private
         */
        function _createTrackerPosition(mizarConfiguration) {
            return new PositionTracker({
                element: (mizarConfiguration.positionTracker && mizarConfiguration.positionTracker.element) ? mizarConfiguration.positionTracker.element : "posTracker",
                isMobile: mizarConfiguration.isMobile,
                position: (mizarConfiguration.positionTracker && mizarConfiguration.positionTracker.position) ? mizarConfiguration.positionTracker.position : "bottom"
            });
        }

        /**
         * Creates elevation tracker
         * @param {Mizar.configuration} mizarConfiguration - Mizar configuration
         * @param {AbstractContext.planetContext} ctxOptions - options
         * @returns {ElevationTracker}
         * @private
         */
        function _createTrackerElevation(mizarConfiguration, ctxOptions) {
            return new ElevationTracker({
                element: (mizarConfiguration.elevationTracker && mizarConfiguration.elevationTracker.element) ? mizarConfiguration.elevationTracker.element : "elevTracker",
                isMobile: mizarConfiguration.isMobile,
                position: (mizarConfiguration.elevationTracker && mizarConfiguration.elevationTracker.elevation) ? mizarConfiguration.elevationTracker.position : "bottom",
                elevationLayer: (ctxOptions.planetLayer !== undefined) ? ctxOptions.planetLayer.elevationLayer : undefined
            });
        }

        /**
         * Creates compass
         * @param {Mizar.configuration} mizarConfiguration - Mizar configuration
         * @returns {Compass}
         * @private
         */
        function _createCompass(mizarConfiguration) {
            return new Compass({
                element: (mizarConfiguration.compass ? mizarConfiguration.compass : "compassDiv"),
                ctx: this,
                isMobile : this.isMobile
            });
        }

        /**
         * Adds to the globe either as background or as additional layer
         * @param {Layer} layer - layer to add.
         * @private
         */
        function _addToGlobe(layer) {
            if (layer.category === "background" && layer.isVisible()) {
                this.globe.setBaseImagery(layer);
            } else {
                this.globe.addLayer(layer);
            }
        }


        /**************************************************************************************************************/
        Utils.inherits(Event, AbstractContext);
        /**************************************************************************************************************/


        /**
         * @function getTime
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getTime = function () {
            return this.time;
        };

        /**
         * @function setTime
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.setTime = function (time) {
            this.time = Time.parse(time);
            for (var i = 0; i < this.layers.length; i++) {
                var layer = this.layers[i];
                layer.setTime(this.time);
            }
        };


        /**
         * ShowUp message.<br/>
         * Do not display the canvas with the ID <i>MizarCanvas</i> and the loading icon and displays
         * the HTML element with the ID <i>webGLNotAvailable</i>
         * @param err
         * @protected
         * @todo Mettre en paramètre MizarCanvas et webGLNotAvailable
         */
        AbstractContext.prototype._showUpError = function (err) {
            console.error("Globe creation error : ", err);
            if (document.getElementById('MizarCanvas')) {
                document.getElementById('MizarCanvas').style.display = "none";
            }
            if (document.getElementById('loading')) {
                document.getElementById('loading').style.display = "none";
            }
            if (document.getElementById('webGLNotAvailable')) {
                document.getElementById('webGLNotAvailable').style.display = "block";
            }
        };

        /**
         * Fill data-provider-type layer by features coming from data object
         * @function _fillDataProvider
         * @param {Layer} layer - layer in which data should be added.
         * @param {Object} mizarDescription - See the base properties {@link AbstractLayer.configuration} and a specific layer for specific properties
         * @memberOf AbstractContext#
         * @protected
         */
        AbstractContext.prototype._fillDataProvider = function (layer, mizarDescription) {
            if (mizarDescription.data && this.dataProviders[mizarDescription.data.type]) {
                var callback = this.dataProviders[mizarDescription.data.type];
                callback(layer, mizarDescription.data);
            }
        };

        /**
         * Returns the data provider layers or an empty array when no data provider layer.
         * @function getDataProviderLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getDataProviderLayers = function () {
            var dpLayers = [];
            var layers = this.getLayers();
            var i = layers.length;
            var layer = layers[i];
            while (layer) {
                if (layer.hasOwnProperty('options') && layer.options.hasOwnProperty('type') && layer.options.type === Constants.LAYER.GeoJSON) {
                    dpLayers.push(layer);
                }
                layer = layers[++i];
            }
            return dpLayers;
        };

        /**
         * @function getTileManager
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getTileManager = function () {
            return this.globe.getTileManager();
        };

        /**
         * Registers no standard data provider and call them in the addLayer method.
         * @function registerNoStandardDataProvider
         * @param {string} type - data provider key
         * @param {Function} loadFunc - Function
         * @memberOf AbstractContext#
         * @example <caption>Registers planets on the sky</caption>
         *   var planetProvider = ProviderFactory.create(Constants.PROVIDER.Planet);
         *   this.registerNoStandardDataProvider("planets", planetProvider.loadFiles);
         */
        AbstractContext.prototype.registerNoStandardDataProvider = function (type, loadFunc) {
            this.dataProviders[type.toString()] = loadFunc;
        };

        /**
         * @function getContextConfiguration
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getContextConfiguration = function () {
            return this.ctxOptions;
        };

        /**
         * @function getMizarConfiguration
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getMizarConfiguration = function () {
            return this.mizarConfiguration;
        };

        /**
         * @function _getGlobe
         * @memberOf AbstractContext#
         * @private
         */
        AbstractContext.prototype._getGlobe = function () {
            return this.globe;
        };

        /**
         * @function getLonLatFromPixel
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getLonLatFromPixel = function (x, y) {
            return this.globe.getLonLatFromPixel(x, y);
        };

        /**
         * @function getPixelFromLonLat
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getPixelFromLonLat = function (longitude, latitude) {
            return this.globe.getPixelFromLonLat(longitude, latitude);
        };

        /**
         * @function getElevation
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getElevation = function (lon, lat) {
            return this.globe.getElevation(lon, lat);
        };

        /**
         * @function getPositionTracker
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getPositionTracker = function () {
            return this.positionTracker;
        };

        /**
         * @function getElevationTracker
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getElevationTracker = function () {
            return this.elevationTracker;
        };

        /**
         * @function getLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getLayers = function () {
            return this.layers;
        };

        /**
         * @function getLayerByID
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getLayerByID = function (layerId) {
            return _.find(_.union(this.getLayers()), function (layer) {
                return (layer.getID() === layerId);
            });
        };

        /**
         * @function getLayerByName
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getLayerByName = function (layerName) {
            return _.findWhere(this.getLayers(), {name: layerName});
        };

        /**
         * @function addLayer
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.addLayer = function (layerDescription, callback, fallback) {
            layerDescription.getCapabilitiesTileManager = this.globe.tileManager;

            var pendingLayersHandler = new PendingLayersRegistryHandler(this.pendingLayers, this.layers);
            var wmsServerHandler = new WMSServerRegistryHandler(this.getMizarConfiguration(), this.pendingLayers);
            var wmtsServerHandler = new WMTSServerRegistryHandler(this.getMizarConfiguration(), this.pendingLayers);
            var wcsServerHandler = new WCSServerRegistryHandler(this.layers, this.getMizarConfiguration(), this.pendingLayers);
            var layerHandler = new LayerRegistryHandler(this.pendingLayers);

            pendingLayersHandler.setNext(wmsServerHandler);
            wmsServerHandler.setNext(wmtsServerHandler);
            wmtsServerHandler.setNext(wcsServerHandler);
            wcsServerHandler.setNext(layerHandler);

            var self = this;
            pendingLayersHandler.handleRequest(layerDescription,
                function (layers) {
                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i];
                        layer.callbackContext = self;

                        self.layers.push(layer);

                        // Take autoFillTimeTravel into account
                        if (layer.autoFillTimeTravel === true) {
                            // Only when visible & time travel service activated and available
                            if ( (layer.visible === true) && (self.timeTravelService) && (typeof self.timeTravelService !== "undefined") ) {
                                self.timeTravelService.update(layer.timeTravelValues);
                            }
                        }

                        _addToGlobe.call(self, layer);

                        self._fillDataProvider(layer, layerDescription);
                        if(layer.isVisible()) {
                            layer.setTime(self.getTime());
                        }

                        if (layer.isPickable()) {
                            ServiceFactory.create(Constants.SERVICE.PickingManager).addPickableLayer(layer);
                        }

                       layer.subscribe(Constants.EVENT_MSG.LAYER_VISIBILITY_CHANGED, _handleCameraWhenLayerAdded);
                        var layerEvent = (layer.category === "background") ? Constants.EVENT_MSG.LAYER_BACKGROUND_ADDED : Constants.EVENT_MSG.LAYER_ADDITIONAL_ADDED;
                        self.publish(layerEvent, layer);

                        //if (layer.addEventTime) {
                        //    layer.addEventTime();
                        //}

                        if (callback) {
                            callback(layer.ID);
                        }
                    }
                },
                function (e) {
                    if(fallback) {
                        fallback(e);
                    }
                });
        };

        /**
         * @function getLinkedLayers
         * @memberOf AbstractContext#
         * @return {Array} Array of linked layers
         * @private
         */

        AbstractContext.prototype.getLinkedLayers = function (layerID) {
            // Search linked layers
            var indexes = $.map(this.layers, function (obj, index) {
                if (obj.linkedTo === layerID) {
                    return index;
                }
            });
            var linkedLayers = [];
            for (var i = 0; i < indexes.length; i++) {
                linkedLayers.push(this.layers[indexes[i]]);
            }
            return linkedLayers;
        };

        /**
         * @function removeLayer
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.removeLayer = function (layerID) {
            var removedLayer = null;
            var indexes = $.map(this.layers, function (obj, index) {
                if (obj.ID === layerID) {
                    return index;
                }
            });

            if (indexes.length > 0) {
                // At least one layer to remove
                var removedLayers = this.layers.splice(indexes[0], 1);
                removedLayer = removedLayers[0];
                if (removedLayer.autoFillTimeTravel === true) {
                    this.timeTravelService.update({
                        "remove" :
                             { "ID" : layerID }
                   });
                }
                var tileManager = this.getTileManager();
                tileManager.abortLayerRequests(removedLayer);

                removedLayer.unsubscribe(Constants.EVENT_MSG.LAYER_VISIBILITY_CHANGED, _handleCameraWhenLayerAdded);
                ServiceFactory.create(Constants.SERVICE.PickingManager).removePickableLayer(removedLayer);
                removedLayer._detach();
            }
            return removedLayer;
        };


        /**
         * @function removeAllLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.removeAllLayers = function () {
            var nbLayers = this.layers.length;
            while (nbLayers != 0) {
                var layerIndex = nbLayers - 1;
                var layerID = this.layers[layerIndex].ID;
                this.attributionHandler.removeAttribution(this.layers[layerIndex]);
                this.removeLayer(layerID);
                nbLayers--;
            }
        };

        /**
         * @function addDraw
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.addDraw = function (layer) {
            this.globe.addLayer(layer);
        };

        /**
         * @function removeDraw
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.removeDraw = function (layer) {
            this.globe.removeLayer(layer);
        };

        /**
         * @function refresh
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.refresh = function () {
            if (this.globe) {
                this.globe.refresh();
            }
        };

        /**************************************************************************************************************/

        /**
         * Initialization of the canvas element.
         * When no canvas element is provided, sets to full screen.
         * @function initCanvas
         * @memberOf AbstractContext#
         * @param {Object} canvas Canvas object
         * @param {?Object} canvas.parentElement HTML object
         */
        AbstractContext.prototype.initCanvas = function (canvas) {
            var width, height;
            var parentCanvas = $(canvas.parentElement);

            $(canvas.parentElement).find('#loading').show();

            if ($(canvas).attr("width")) {
                width = $(canvas).attr("width");
            } else if (parentCanvas.attr("width")) {
                width = parentCanvas.attr("width");
            } else {
                //full screen
                width = window.innerWidth;
            }

            if ($(canvas).attr("height")) {
                height = $(canvas).attr("height");
            } else if (parentCanvas.attr("height")) {
                height = parentCanvas.attr("height");
            } else {
                //full screen
                height = window.innerHeight;
            }


            canvas.width = width;
            canvas.height = height;

            // Add some useful css properties to parent element
            if (parentCanvas) {
                parentCanvas.css({
                    position: "relative",
                    overflow: "hidden"
                });
            }

            // Define on resize function
            var self = this;
            var onResize = function () {
                if (parentCanvas && parentCanvas.attr("height") && parentCanvas.attr("width")) {
                    // Embedded
                    canvas.width = parentCanvas.width();
                    canvas.height = parentCanvas.height();
                }
                else {
                    // Fullscreen
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                self.refresh();
            };

            // Take into account window resize 1s after resizing stopped
            var timer;
            $(window).resize(function () {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(onResize, 500);
            });

            // Context lost listener
            canvas.addEventListener("webglcontextlost", function (event) {
                // TODO
                event.preventDefault();
                document.getElementById('loading').style.display = "none";
                document.getElementById('webGLContextLost').style.display = "block";
            }, false);
        };

        /**
         * Initializes the planet or sky events.
         * @function iniGlobeEvents
         * @memberOf AbstractContext#
         * @param {AbstractGlobe} globe Planet or Sky object
         */
        AbstractContext.prototype.initGlobeEvents = function (globe) {
            if (globe) {
                this.globe = globe;
                this.attributionHandler = new AttributionHandler(
                    this.globe,
                    {
                        element: (this.mizarConfiguration.attributionHandler && this.mizarConfiguration.attributionHandler.element)
                            ? this.mizarConfiguration.attributionHandler.element : 'globeAttributions'
                    }
                );

                if (this.positionTracker != null) {
                    this.positionTracker.attachTo(this);
                    // it will be updated by the position tracker
                    this.setComponentVisibility("posTrackerInfo", false);
                }

                if (this.elevationTracker != null) {
                    this.elevationTracker.attachTo(this);
                }

                if (this.compass != null) {
                    this.compass.attachTo(this);
                }

            }

            _initComponentsVisibility(this.components);

            //When base layer failed to load, open error dialog
            var self = this;
            this.subscribe(Constants.EVENT_MSG.BASE_LAYERS_ERROR, function (layer) {
                $(self.canvas.parentElement).find('#loading').hide();
                //JSON.stringify(layer)
                ErrorDialog.open("Cannot add the layer <font style='color:yellow'><b>" + layer.getName() + "</b></font><font color='grey'><i>(" + layer.getBaseUrl() + " - reason : " + layer.message + ")</i></font>.");
            });
        };


        /**************************************************************************************************************/

        /**
         * @function show
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.show = function () {
            this.navigation.start();
            this.showComponents();
        };

        /**
         * @function showComponents
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.showComponents = function () {
            // Show UI components depending on its state
            for (var componentId in this.components) {
                if (_isDivExist(componentId) && this.components[componentId]) {
                    $("#" + componentId).fadeIn(1000);
                }
            }
        };

        /**
         * @function hideComponents
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.hideComponents = function (uiArray) {
            // Hide all the UI components
            for (var componentId in this.components) {
                if (_isDivExist(componentId) && $.inArray(componentId, uiArray) === -1) {
                    console.log("hideComp : fadeout "+componentId);
                    $("#" + componentId).fadeOut();
                }
            }
        };

        /**
         * @function hide
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.hide = function () {
            this.navigation.stopAnimations();
            this.navigation.stop();

            // Hide all the UI components
            for (var componentId in this.components) {
                if (_isDivExist(componentId)) {
                    console.log("hideComp : fadeout "+componentId);
                    $("#" + componentId).fadeOut();
                }
            }
        };

        /**
         * @function setComponentVisibility
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.setComponentVisibility = function (componentId, isVisible) {
            var component = $("#" + componentId);
            if (isVisible) {
                component.show();
            }
            else {
                component.hide();
            }

            this.components[componentId] = isVisible;
        };

        /**
         * @function getComponentVisibility
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getComponentVisibility = function (componentId) {
            return this.components[componentId];
        };

        /**************************************************************************************************************/

        /**
         * @function showAdditionalLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.showAdditionalLayers = function () {
            _.each(this.visibleLayers, function (layer) {
                layer.setVisible(true);
                if (layer.isPickable()) {
                    ServiceFactory.create(Constants.SERVICE.PickingManager).addPickableLayer(layer);
                }
            });
        };


        /**
         * @function hideAdditionalLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.hideAdditionalLayers = function () {
            var self = this;
            this.visibleLayers = [];
            var gwLayers = this.getAdditionalLayers();
            _.each(gwLayers, function (layer) {
                if (layer.isVisible()) {
                    layer.setVisible(false);
                    self.visibleLayers.push(layer);
                }

            });
        };

        /**
         * @function setBackgroundLayer
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.setBackgroundLayer = function (survey) {
            //var globe = this.globe;

            // Find the layer by name among all the layers
            var gwLayer = this.getLayerByName(survey);
            if (gwLayer) {
                this.globe.setBaseImagery(gwLayer);
                this.publish(Constants.EVENT_MSG.LAYER_BACKGROUND_CHANGED, gwLayer);

            } else {
                this.publish(Constants.EVENT_MSG.LAYER_BACKGROUND_ERROR, "Survey " + layerName + " hasn't been found");
            }
            return gwLayer;
        };

        /**
         * @function setBackgroundLayerByID
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.setBackgroundLayerByID = function (surveyID) {
            // Find the layer by name among all the layers
            var gwLayer = this.getLayerByID(surveyID);
            if (gwLayer) {
                this.globe.setBaseImagery(gwLayer);
            }
            return gwLayer;
        };

        /**
         * @function getAdditionalLayers
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getAdditionalLayers = function () {
            return _.filter(this.layers, function (layer) {
                return layer.category !== "background";
            });
        };

        /**
         * @function getRenderContext
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getRenderContext = function () {
            return this.globe.getRenderContext();
        };

        /**
         * @function disbable
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.disable = function () {
            if (this.positionTracker) {
                this.positionTracker.detach();
            }
            if (this.elevationTracker) {
                this.elevationTracker.detach();
            }
            if (this.compass) {
                this.compass.detach();
            }
            var i = 0;
            var layer = this.layers[i];
            while (layer) {
                this.attributionHandler.disable(layer);
                layer = this.layers[++i];
            }
            var renderers = this.getRenderContext().renderers;
            for (var j = 0; j < renderers.length; j++) {
                if (renderers[j].getType() === this.getMode()) {
                    renderers[j].disable();
                }
            }
        };

        /**
         * @function enable
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.enable = function () {
            this.positionTracker.attachTo(this);
            this.elevationTracker.attachTo(this);
            this.compass.attachTo(this);
            var i = 0;
            var layer = this.layers[i];
            while (layer) {
                if (layer.isPickable()) {
                    ServiceFactory.create(Constants.SERVICE.PickingManager).addPickableLayer(layer);
                }
                this.attributionHandler.enable(layer);
                layer = this.layers[++i];
            }
            var renderers = this.getRenderContext().renderers;
            for (i = 0; i < renderers.length; i++) {
                if (renderers[i].getType() === this.getMode()) {
                    renderers[i].enable();
                }
            }
        };

        /**
         * @function setCompassVisible
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.setCompassVisible = function (divName, visible) {
            throw new SyntaxError("compass visible not implemented", "AbstractContext.js");
        };

        /**
         * @function setTimeTravelVisible
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.setTimeTravelVisible = function (divName, visible) {
            throw new SyntaxError("time travel visible not implemented", "AbstractContext.js");
        };


        /**
         * @function getMode
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getMode = function () {
            return this.mode;
        };

        /**
         * @function setCoordinateSystem
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.setCoordinateSystem = function (cs) {
            throw new SyntaxError("CRS not implemented", "AbstractContext.js");
        };

        /**
         * @function getNavigation
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getNavigation = function () {
            return this.navigation;
        };

        /**
         * @function getCoordinateSystem
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.getCoordinateSystem = function () {
            return this.globe.getCoordinateSystem();
        };

        /**
         * @function addAnimation
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.addAnimation = function (anim) {
            this.globe.addAnimation(anim);
        };

        /**
         * @function removeAnimation
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.removeAnimation = function (anim) {
            this.globe.removeAnimation(anim);
        };

        /**
         * @function render
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.render = function () {
            this.globe.render();
        };

        /**
         * @function dispose
         * @memberOf AbstractContext#
         */
        AbstractContext.prototype.dispose = function () {
            this.globe.dispose();
        };

        AbstractContext.prototype.trackerDestroy = function () {
            if (this.elevationTracker) {
                this.elevationTracker.destroy();
                this.elevationTracker = null;
            }
            if (this.positionTracker) {
                this.positionTracker.destroy();
                this.positionTracker = null;
            }
        };

        /**i
         * @function destroy
         * @memberOf AbstractContext#
         * @abstract
         */
        AbstractContext.prototype.destroy = function () {
            this.hide();
            this.trackerDestroy();
            if(this.compass) {
                this.compass.destroy();
                this.compass = null;
            }
            this.removeAllLayers();
            this.components = null;
            this.attributionHandler = null;
            this.layers = null;
            this.visibleLayers = null;
            this.dataProviders = null;
            this.mizarConfiguration = null;
            this.ctxOptions = null;
            this.mode = null;

            this.unsubscribe(Constants.EVENT_MSG.BASE_LAYERS_READY, function (imagery) {
                // When the background takes time to load, the viewMatrix computed by "computeViewMatrix" is created but
                // with empty values. Because of that, the globe cannot be displayed without moving the camera.
                // So we rerun "computeViewMatrix" once "baseLayersReady" is loaded to display the globe
                if (self.getNavigation().getRenderContext().viewMatrix[0] !== "undefined") {
                    self.getNavigation().computeViewMatrix();
                }
            });
            if (this.navigation) {
                this.navigation.destroy();
                this.navigation = null;
            }

            if (this.globe) {
                this.globe.destroy();
                this.globe = null;
            }
            this.canvas = null;
        };


        /**************************************************************************************************************/

        return AbstractContext;

    }
);
