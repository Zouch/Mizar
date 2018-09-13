/*******************************************************************************
 * Copyright 2017, 2018 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
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
/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/
define([
    "../Renderer/FeatureStyle",
    "../Renderer/RendererManager",
    "../Utils/Utils",
    "../Utils/UtilsIntersection",
    "./AbstractLayer",
    "./GroundOverlayLayer",
    "../Renderer/RendererTileData",
    "../Tiling/Tile",
    "../Tiling/GeoTiling",
    "../Utils/Constants",
    "./OpenSearch/OpenSearchForm",
    "./OpenSearch/OpenSearchUtils",
    "./OpenSearch/OpenSearchResult",
    "./OpenSearch/OpenSearchRequestPool",
    "./OpenSearch/OpenSearchCache",
    "moment"
], function (
    FeatureStyle,
    RendererManager,
    Utils,
    UtilsIntersection,
    AbstractLayer,
    GroundOverlayLayer,
    RendererTileData,
    Tile,
    GeoTiling,
    Constants,
    OpenSearchForm,
    OpenSearchUtils,
    OpenSearchResult,
    OpenSearchRequestPool,
    OpenSearchCache,
    Moment
) {
        /**
         * Update status attribute.<br/>
         * Called with pagination
         * @event OpenSearchLayer#updateStatsAttribute
         * @type {OpenSearchLayer~pagination|OpenSearchLayer~result}
         */

        /**
         * Toggle WMS<br/>
         * Called to display/undisplay the WMS related to the opensearch record
         * @event OpenSearchLayer#toggleWMS
         * @type {object}
         * @property {string} layer_name Name of the layer to make visible
         * @property {boolean} visible display/undisplay the layer related to the opensearch record
         */

        /**
        * Opensearch pagination.
        * @typedef {object} OpenSearchLayer~pagination
        * @property {string} shortName of the opensearch layer
        * @property {int} current page in the query   
        */

        /**
        * Opensearch result.
        * @typedef {object} OpenSearchLayer~result
        * @property {string} shortName of the opensearch layer
        * @property {int} nb_loaded number of loaded records
        * @property {int} nb_total total number of records 
        */

        /**
        * The time object.
        * @typedef {object} TimeTravelParams~details
        * @property {date|moment} date - the current time.
        * @property {string} display - the current date as string for display.
        * @property {object} [period] - time period.
        * @property {moment} [period.from] - start date.
        * @property {moment} [period.to] - stop date.
        */
        /**
         * @name OpenSearchLayer
         * @class
         * This layer draws an OpenSearch dynamic layer
         * @augments AbstractLayer
         * @param {Object} options Configuration properties for the layer. See {@link AbstractLayer} for base properties
         * @param {String} options.serviceUrl Url of OpenSearch description XML file
         * @param {int} [options.minOrder=5] Starting order for OpenSearch requests
         * @param {int} [options.maxRequests=2] Max request
         * @param {Boolean} [options.invertY=false] a boolean, if set all the image data of current layer is flipped along the vertical axis
         * @param {Boolean} [options.coordSystemRequired=true]
         * @param {FeatureStyle} [options.style=new FeatureStyle()]
         * @memberof module:Layer
         */
        var OpenSearchLayer = function (options) {
            AbstractLayer.prototype.constructor.call(
                this,
                Constants.LAYER.OpenSearch,
                options
            );

            this.name = options.name;
            this.title = options.title;

            this.afterLoad = options.afterLoad;

            this.minOrder = options.minOrder || 5;
            this.maxRequests = options.maxRequests || 2;
            this.invertY = options.invertY || false;
            this.coordSystemRequired = options.hasOwnProperty("coordSystemRequired")
                ? options.coordSystemRequired
                : true;

            this.oldBound = null;

            this.previousViewKey = null;
            this.previousTileWidth = null;
            this.previousDistance = null;

            // Used for picking management
            //this.features = [];
            // Counter set, indicates how many times the feature has been requested
            //this.featuresSet = {};
            //this.tilesToLoad = [];

            // Keep save of all tiles where a feature is set, in order to remove all when reset
            //this.allTiles = {};

            // Keep trace of all features loaded (TODO: make object more light, just keep geometry and style ?)
            this.features = [];
            // Keep trace of all features id loaded
            this.featuresIdLoaded = [];
            // Keep trace of all tiles loaded (bound, key and features id associated)
            this.tilesLoaded = [];

            // last datetime for removing outside
            this.lastRemovingDateTime = null;
            this.removingDeltaSeconds = options.hasOwnProperty(
                "removingDeltaSeconds"
            )
                ? options.removingDeltaSeconds
                : 5;

            // OpenSearch result
            this.result = new OpenSearchResult();

            // Pool for request management (manage outside to be sharable between multiple opensearch layers)
            this.pool = options.openSearchRequestPool;

            // Cache for data management
            this.cache = new OpenSearchCache();

            // Force Refresh
            this.forceRefresh = false;

            this.getCapabilitiesUrl = options.baseUrl;

            if (typeof this.getGetCapabilitiesUrl() !== "undefined") {
                this.hasForm = true;
                this.loadGetCapabilities(
                    this.manageCapabilities,
                    this.getGetCapabilitiesUrl(),
                    this
                );
            } else {
                this.hasForm = false;
            }

            // Layer created on-the-fly to display quickook over openSearch layer
            // TODO: optimisation : created only once and reused ?
            this.currentQuicklookLayer = null;
            // Id of current feature displayed
            this.currentIdDisplayed = null;

            if (typeof document.currentOpenSearchLayer === "undefined") {
                document.currentOpenSearchLayer = [];
            }
            document.currentOpenSearchLayer[this.ID] = this;
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractLayer, OpenSearchLayer);

        /**************************************************************************************************************/

        OpenSearchLayer.TileState = {
            LOADING: 0,
            LOADED: 1,
            NOT_LOADED: 2
        };

        /**************************************************************************************************************/

        /**
         * @function getInformationType
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.getInformationType = function () {
            return Constants.INFORMATION_TYPE.VECTOR;
        }

        /**
         * @function setTime
         * @memberof OpenSearchLayer#
         * @param {Time.configuration} time Time configuration
         */
        OpenSearchLayer.prototype.setTime = function (time) {
            AbstractLayer.prototype.setTime(time);
            this.setParameter.call(this, "mizar:time", time);
        };

        /**
         * @function setParameter
         * @memberof OpenSearchLayer#
         * @param {String} paramName Name of parameter
         * @param {Time.configuration} value Time configuration
         */
        OpenSearchLayer.prototype.setParameter = function (paramName, value) {
            if (paramName === "mizar:time") {
                value.period.from = Moment(value.period.from).format(
                    "YYYY-MM-DD HH:mm"
                );
                value.period.to = Moment(value.period.to).format(
                    "YYYY-MM-DD HH:mm"
                );

                OpenSearchUtils.setCurrentValueToParam(
                    this.getServices().queryForm,
                    "startDate",
                    value.period.from
                );
                OpenSearchUtils.setCurrentValueToParam(
                    this.getServices().queryForm,
                    "completionDate",
                    value.period.to
                );
            } else {
                OpenSearchUtils.setCurrentValueToParam(
                    this.getServices().queryForm,
                    paramName,
                    value
                );
            }
            this.resetAll();
        };

        /**
         * Go to next page
         * @function nextPage
         * @memberof OpenSearchLayer#
         * @fires OpenSearchLayer#updateStatsAttribute
         */
        OpenSearchLayer.prototype.nextPage = function () {
            var num = OpenSearchUtils.getCurrentValue(
                this.getServices().queryForm,
                "page"
            );
            // If not specified, set default to 1
            if (num === null || typeof num === "undefined") {
                num = 1;
            }
            OpenSearchUtils.setCurrentValueToParam(
                this.getServices().queryForm,
                "page",
                num * 1 + 1
            );

            // update labels
            this.callbackContext.publish(
                Constants.EVENT_MSG.LAYER_UPDATE_STATS_ATTRIBUTES,
                {
                    shortName: this.getShortName(),
                    page: num + 1
                }
            );

            this.forceRefresh = true;
            for (var i = 0; i < this.tilesLoaded.length; i++) {
                this.tilesLoaded[i].tile.osState[this.getID()] =
                    OpenSearchLayer.TileState.NOT_LOADED;
            }
            this.getGlobe()
                .getRenderContext()
                .requestFrame();
        };

        /**************************************************************************************************************/

        /**
         * When getCapabilities is loading, manage it
         * @function manageCapabilities
         * @memberof OpenSearchLayer#
         * @param json Json object
         * @param sourceObject Object where data is stored
         * @private
         */
        OpenSearchLayer.prototype.manageCapabilities = function (
            json,
            sourceObject
        ) {
            // check if form description is well provided
            var dataForm = null;
            var openSearchRoot = json.OpenSearchDescription;
            if (typeof openSearchRoot !== "undefined") {
                sourceObject.name =
                    typeof sourceObject.name !== "undefined"
                        ? sourceObject.name
                        : OpenSearchUtils.getValue(openSearchRoot, "ShortName");
                sourceObject.title =
                    typeof sourceObject.title !== "undefined"
                        ? sourceObject.title
                        : OpenSearchUtils.getValue(openSearchRoot, "LongName");
                var urls = openSearchRoot.Url;
                if (typeof urls !== "undefined") {
                    dataForm = urls;
                }
            }
            if (dataForm != null) {
                // Load form description
                sourceObject.getServices().queryForm = new OpenSearchForm(
                    dataForm,
                    "application/json"
                );
                console.log("FORM !", sourceObject.getServices().queryForm);
                OpenSearchUtils.initNavigationValues(
                    sourceObject.getServices().queryForm
                );
            } else {
                console.error("Form not correct");
            }

            if (
                sourceObject.callbackContext !== null &&
                typeof sourceObject.callbackContext !== "undefined"
            ) {
                sourceObject.callbackContext.addLayerFromObject(
                    sourceObject,
                    sourceObject.options
                );
            }

            if (typeof sourceObject.afterLoad === "function") {
                // Update GUI !!
                sourceObject.afterLoad(sourceObject);
            }
        };

        /**************************************************************************************************************/

        /**
         * Attaches the layer to the globe
         * @function _attach
         * @memberof OpenSearchLayer#
         * @param g The globe
         * @private
         */
        OpenSearchLayer.prototype._attach = function (g) {
            AbstractLayer.prototype._attach.call(this, g);
            this.extId += this.id;
            g.getTileManager().addPostRenderer(this);
        };

        /**************************************************************************************************************/

        /**
         * Detach the layer from the globe
         * @function _detach
         * @memberof OpenSearchLayer#
         * @private
         */
        OpenSearchLayer.prototype._detach = function () {
            this.getGlobe()
                .getTileManager()
                .removePostRenderer(this);
            AbstractLayer.prototype._detach.call(this);
        };

        /**************************************************************************************************************/

        OpenSearchLayer.prototype.getTileByKey = function (key) {
            for (var i = 0; i < this.tilesLoaded.length; i++) {
                if (this.tilesLoaded[i].key === key) {
                    return this.tilesLoaded[i];
                }
            }
            return null;
        };
        /**
         * Launches request to the OpenSearch service.
         * @function launchRequest
         * @memberof OpenSearchLayer#
         * @param {Tile} tile Tile
         * @param {String} url Url
         * @fires Layer#startLoad
         * @fires Layer#endLoad
         * @fires Layer#features:added
         */
        OpenSearchLayer.prototype.launchRequest = function (tile, url) {
            var key = this.cache.getKey(tile.bound);
            if (this.getTileByKey(key) === null) {
                this.tilesLoaded.push({
                    key: key,
                    tile: tile
                });
            }
            this.pool.addQuery(url, tile, key, this);
        };

        /**************************************************************************************************************/

        /**
         * Remove all previous features
         * @function removeFeatures
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.removeFeatures = function () {
            // clean renderers
            while (this.features.length > 0) {
                //this.getGlobe().rendererManager.removeGeometry(this.features[i].geometry);
                this.removeFeature(this.features[0].id);
            }

            for (var i = 0; i < this.tilesLoaded.length; i++) {
                this.tilesLoaded[i].tile.osState[this.getID()] =
                    OpenSearchLayer.TileState.NOT_LOADED;
            }

            //this.globe.refresh();
            if (this.getGlobe() && this.getGlobe().getRenderContext()) {
                this.getGlobe()
                    .getRenderContext()
                    .requestFrame();
            }
        };

        /**************************************************************************************************************/

        /**
         * Remove all feature still used by a tile
         * @function removeTile
         * @param {Tile} tile Tile
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.removeTile = function (tile) {
            if (typeof tile.associatedFeaturesId === "undefined") {
                tile.associatedFeaturesId = [];
            }
            var index = null;
            // For each feature of the tile
            for (var i = 0; i < tile.associatedFeaturesId.length; i++) {
                var featureId = tile.associatedFeaturesId[i];
                // Is this feature is used in other tile ?
                var isUsed = false;
                for (var j = 0; j < this.tilesLoaded.length; j++) {
                    var aTile = this.tilesLoaded[j].tile;
                    if (tile.key !== aTile.key) {
                        if (typeof aTile.associatedFeaturesId !== "undefined") {
                            index = aTile.associatedFeaturesId.indexOf(featureId);
                        } else {
                            index = -1;
                        }
                        if (index >= 0) {
                            isUsed = true;
                            break;
                        }
                    }
                }

                if (isUsed === false) {
                    this.removeFeature(featureId);
                }
            }

            tile.associatedFeaturesId = [];

            // Remove the tile
            index = -1;
            for (i = 0; i < this.tilesLoaded.length; i++) {
                if (this.tilesLoaded[i].tile.key === tile.key) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                this.tilesLoaded.splice(index, 1);
            }
        };

        /**************************************************************************************************************/

        /**
         * Remove all previous features
         * @function removeFeaturesOutside
         * @param {JSon} extent Extent
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.removeFeaturesOutside = function (extent) {
            // clean renderers
            var nbRemoved = 0;
            for (var i = 0; i < this.tilesLoaded.length; i++) {
                var tile = this.tilesLoaded[i].tile;
                var intersects = UtilsIntersection.boundsIntersects(
                    tile.bound,
                    extent
                );
                if (intersects === false) {
                    this.removeTile(tile);
                    nbRemoved++;
                }
            }
            //console.log(nbRemoved+" tiles removed");
        };

        /**************************************************************************************************************/

        /**
         * Adds feature to the layer
         * @function addFeature
         * @memberof OpenSearchLayer#
         * @param {Feature} feature Feature
         */
        OpenSearchLayer.prototype.addFeature = function (feature) {
            // update list id added
            this.featuresIdLoaded.push(feature.id);

            var defaultCrs = {
                type: "name",
                properties: {
                    name: Constants.CRS.WGS84
                }
            };

            feature.geometry.gid = feature.id;

            // MS: Feature could be added from ClusterOpenSearch which have features with different styles
            var style = feature.properties.style
                ? feature.properties.style
                : this.style;
            //style.visible = true;
            style.opacity = this.getOpacity();

            this.features.push(feature);

            // Add features to renderer if layer is attached to planet
            if (this.globe) {
                this._addFeatureToRenderers(feature);
                if (this.isVisible()) {
                    this.getGlobe()
                        .getRenderContext()
                        .requestFrame();
                }
            }
        };

        /**************************************************************************************************************/

        /**
         * Add a feature to renderers
         * @function _addFeatureToRenderers
         * @memberof GeoJsonLayer#
         * @param {GeoJSON} feature Feature
         * @private
         */
        OpenSearchLayer.prototype._addFeatureToRenderers = function (feature) {
            var geometry = feature.geometry;

            // Manage style, if undefined try with properties, otherwise use defaultStyle
            var style = this.style;
            var props = feature.properties;
            if (props && props.style) {
                style = props.style;
            }

            // Manage geometry collection
            if (geometry.type === "GeometryCollection") {
                var geoms = geometry.geometries;
                for (var i = 0; i < geoms.length; i++) {
                    this.getGlobe().rendererManager.addGeometry(
                        this,
                        geoms[i],
                        style
                    );
                }
            } else {
                // Add geometry to renderers
                this.getGlobe().rendererManager.addGeometry(
                    this,
                    geometry,
                    style
                );
            }
        };

        /**************************************************************************************************************/

        /**
         * Add a feature to renderers current level
         * @function _addFeatureToRenderersCurrentLevel
         * @memberof GeoJsonLayer#
         * @param {GeoJSON} feature Feature
         * @private
         */
        OpenSearchLayer.prototype._addFeatureToRenderersCurrentLevel = function (
            feature
        ) {
            var geometry = feature.geometry;

            // Manage style, if undefined try with properties, otherwise use defaultStyle
            var style = this.style;
            var props = feature.properties;
            if (props && props.style) {
                style = props.style;
            }

            // Manage geometry collection
            if (geometry.type === "GeometryCollection") {
                var geoms = geometry.geometries;
                for (var i = 0; i < geoms.length; i++) {
                    this.getGlobe().rendererManager.addGeometryCurrentLevel(
                        this,
                        geoms[i],
                        style
                    );
                }
            } else {
                // Add geometry to renderers
                this.getGlobe().rendererManager.addGeometryCurrentLevel(
                    this,
                    geometry,
                    style
                );
            }
        };

        /**************************************************************************************************************/

        /**
         * Remove a feature from renderers
         * @function _removeFeatureFromRenderers
         * @memberof GeoJsonLayer#
         * @param {GeoJSON} feature Feature
         * @private
         */
        OpenSearchLayer.prototype._removeFeatureFromRenderersCurrentLevel = function (
            feature
        ) {
            return this.globe.getRendererManager().removeGeometryCurrentLevel(
                feature.geometry,
                this
            );
        };

        /**
         * Remove a feature from renderers
         * @function _removeFeatureFromRenderers
         * @memberof GeoJsonLayer#
         * @param {GeoJSON} feature Feature
         * @private
         */
        OpenSearchLayer.prototype._removeFeatureFromRenderers = function (feature) {
            return this.globe.getRendererManager().removeGeometry(
                feature.geometry,
                this
            );
        };

        /**
         * Removes feature from Dynamic OpenSearch layer.
         *  (called when it's sure to have to remove feature)
         * @function removeFeature
         * @memberof OpenSearchLayer#
         * @param {String} featureId Feature id
         */
        OpenSearchLayer.prototype.removeFeature = function (featureId) {
            var featureIndex = this.getFeatureIndexById(featureId);
            var feature = this.features[featureIndex];

            if (typeof feature === "undefined") {
                return;
            }
            // remove id from featuresId
            var index = this.featuresIdLoaded.indexOf(featureId);
            if (index !== -1) this.featuresIdLoaded.splice(index, 1);

            this.getGlobe().rendererManager.removeGeometry(
                feature.geometry,
                this
            );

            // Remove from list of features
            this.features.splice(featureIndex, 1);
        };

        /**************************************************************************************************************/

        /**
         * Load quicklook
         * @function loadQuicklook
         * @memberof OpenSearchLayer#
         * @param {Feature} feature Feature
         * @param {String} url Url of image
         */
        OpenSearchLayer.prototype.loadQuicklook = function (feature, url) {
            // Save coordinates
            this.currentIdDisplayed = feature.id;

            // Get quad coordinates
            var coordinates = feature.geometry.coordinates[0];
            var quad = [];
            for (var i = 0; i < 4; i++) {
                quad[i] = coordinates[i];
            }

            if (this.currentQuicklookLayer === null) {
                // Creation first time
                this.currentQuicklookLayer = new GroundOverlayLayer({
                    quad: quad,
                    image: url
                });
                this.currentQuicklookLayer._attach(this.globe);
            } else {
                this.currentQuicklookLayer.update(quad, url);
            }
            this.getGlobe().refresh();
        };

        /**************************************************************************************************************/

        /**
         * Indicate if quicklook is currently displayed
         * @function isQuicklookDisplayed
         * @memberof OpenSearchLayer#
         * @return {Boolean} Is quicklook currently displayed ?
         */
        OpenSearchLayer.prototype.isQuicklookDisplayed = function () {
            // Trivial case
            return this.currentQuicklookLayer !== null;
        };

        /**************************************************************************************************************/

        /**removeGeometry
         * Remove quicklook
         * @function removeQuicklook
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.removeQuicklook = function () {
            if (this.currentQuicklookLayer === null) {
                return;
            }

            this.currentQuicklookLayer._detach();
            this.currentQuicklookLayer = null;
        };

        /**************************************************************************************************************/

        /**
         * Highlight feature
         * @function highlight
         * @memberof OpenSearchLayer#
         * @param {Feature} feature Feature
         * @param {FeatureStyle} style Style
         */
        OpenSearchLayer.prototype.highlight = function (feature, style) {
            feature.properties.style = style;
            this._addFeatureToRenderersCurrentLevel(feature);
        };

        /**
         * Unhighlight feature
         * @function unhighlight
         * @memberof OpenSearchLayer#
         * @param {Feature} feature Feature
         * @param {FeatureStyle} style Style
         */
        OpenSearchLayer.prototype.unhighlight = function (feature, style) {
            this._removeFeatureFromRenderersCurrentLevel(feature);
        };

        /**
         * Modify feature style.
         * @function modifyFeatureStyle
         * @memberof OpenSearchLayer#
         * @param {Feature} feature Feature
         * @param {FeatureStyle} style Style
         */
        OpenSearchLayer.prototype.modifyFeatureStyle = function (feature, style) {
            if (this._removeFeatureFromRenderers(feature)) {
                feature.properties.style = style;
                this._addFeatureToRenderers(feature);
            }
        };

        /**************************************************************************************************************/

        /**
         * Prepare parameters for a given bound
         * @function prepareParameters
         * @memberof OpenSearchLayer#
         * @param {Bound} bound Bound
         */
        OpenSearchLayer.prototype.prepareParameters = function (bound) {
            var param; // param managed
            var code; // param code
            for (
                var i = 0;
                i < this.getServices().queryForm.parameters.length;
                i++
            ) {
                param = this.getServices().queryForm.parameters[i];
                code = param.value;
                code = code.replace("?}", "}");
                if (code === "{geo:box}") {
                    // set bbox
                    param.currentValue =
                        bound.west +
                        "," +
                        bound.south +
                        "," +
                        bound.east +
                        "," +
                        bound.north;
                }
            }
        };

        /**************************************************************************************************************/

        /**
         * Build request url
         * @function buildUrl
         * @memberof OpenSearchLayer#
         * @param {Bound} bound Bound
         * @return {String} Url
         */
        OpenSearchLayer.prototype.buildUrl = function (bound) {
            //var url = this.serviceUrl + "/search?order=" + tile.order + "&healpix=" + tile.pixelIndex;
            if (!this.getServices().hasOwnProperty("queryForm")) {
                return null;
            }
            var url = this.getServices().queryForm.template;

            // Prepare parameters for this tile
            this.prepareParameters(bound);

            // Check each parameter
            var param; // param managed
            var currentValue; // value set
            for (
                var i = 0;
                i < this.getServices().queryForm.parameters.length;
                i++
            ) {
                param = this.getServices().queryForm.parameters[i];
                currentValue = param.currentValueTransformed();
                if (currentValue === null) {
                    // Remove parameter if not mandatory (with a ?)
                    url = url.replace(
                        "&" + param.name + "=" + param.value.replace("}", "?}"),
                        ""
                    );
                    url = url.replace(
                        param.name + "=" + param.value.replace("}", "?}"),
                        ""
                    );
                    // Set blank if parameter is mandatory
                    url = url.replace(param.value, "");
                } else {
                    // replace value
                    url = url.replace(param.value, currentValue);
                    // replace optional value
                    url = url.replace(param.value.replace("}", "?}"), currentValue);
                }
            }
            return this.proxify(url);
        };

        /**************************************************************************************************************/

        /**
         * Internal function to sort tiles
         * @function _sortTilesByDistance
         * @param {Tile} t1 First tile
         * @param {Tile} t2 Second tile
         * @private
         */
        function _sortTilesByDistance(t1, t2) {
            return t1.distance - t2.distance;
        }

        /**************************************************************************************************************/

        /**
         * Render function
         * @function render
         * @memberof OpenSearchLayer#
         * @param tiles The array of tiles to render
         */
        OpenSearchLayer.prototype.render = function (tiles) {
            if (!this.isVisible()) {
                return;
            }

            this.tiles = tiles;

            this.needRefresh = false;
            this.globalKey = this.cache.getArrayBoundKey(this.tiles);

            if (this.forceRefresh === true) {
                // Remove cache, in order to reload new features
                this.cleanCache();
                this.forceRefresh = false;
            }

            if (this.previousViewKey === null) {
                this.needRefresh = true;
            } else {
                this.needRefresh = this.previousViewKey !== this.globalKey;
            }

            if (this.needRefresh) {
                // Sort tiles in order to load the first tiles closed to the camera
                this.tiles.sort(_sortTilesByDistance);

                // =========================================================================
                // Determination of zoom level change
                // =========================================================================

                this.newTileWidth =
                    this.tiles[0].bound.east - this.tiles[0].bound.west;
                this.ctx = this.callbackContext;
                this.distance = null;
                if (this.ctx) {
                    this.initNav = this.ctx.getNavigation();
                    this.distance = this.initNav.getDistance();
                }

                // TODO : warning, float comparison not ok
                this.isZoomLevelChanged = false;
                this.isZoomLevelChanged =
                    this.newTileWidth !== this.previousTileWidth;
                if (this.ctx) {
                    this.isZoomLevelChanged =
                        this.isZoomLevelChanged &&
                        this.distance !== this.previousDistance;
                    this.previousDistance = this.distance;
                }
                if (this.isZoomLevelChanged) {
                    // Go to page 1
                    OpenSearchUtils.setCurrentValueToParam(
                        this.getServices().queryForm,
                        "page",
                        1
                    );

                    this.result.featuresLoaded = 0;
                    this.result.featuresLoaded = this.features.length;
                }

                // =========================================================================
                // Check each tile
                // =========================================================================

                this.previousTileWidth = this.newTileWidth;
                this.previousViewKey = this.globalKey;
                this.result.featuresTotal = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    this.currentTile = this.tiles[i];
                    if (typeof this.currentTile.key === "undefined") {
                        this.currentTile.key = this.cache.getKey(
                            this.currentTile.bound
                        );
                    }
                    // If no state defined...
                    if (
                        this.currentTile.osState === null ||
                        typeof this.currentTile.osState === "undefined"
                    ) {
                        //...set it to NOT_LOADED
                        this.currentTile.osState = [];
                    }
                    if (
                        this.currentTile.osState[this.getID()] === null ||
                        typeof this.currentTile.osState[this.getID()] ===
                        "undefined"
                    ) {
                        this.currentTile.osState[this.getID()] =
                            OpenSearchLayer.TileState.NOT_LOADED;
                    }
                    if (
                        this.currentTile.osState[this.getID()] ===
                        OpenSearchLayer.TileState.NOT_LOADED
                    ) {
                        var url = this.buildUrl(this.currentTile.bound);
                        if (url !== null) {
                            this.currentTile.osState[this.getID()] =
                                OpenSearchLayer.TileState.LOADING;
                            this.launchRequest(this.currentTile, url);
                        }
                    } else if (
                        this.currentTile.osState[this.getID()] ===
                        OpenSearchLayer.TileState.LOADED
                    ) {
                        //console.log("tile still loaded !!!");
                    } else if (
                        this.currentTile.osState[this.getID()] ===
                        OpenSearchLayer.TileState.LOADING
                    ) {
                        //console.log("tile loading...");
                    }

                    /**tileCache = this.cache.getTile(tiles[i].bound);
                        this.updateGUI();
                        if (tileCache === null) {
                            var url = this.buildUrl(tiles[i].bound);
                            if (url !== null) {
                                this.launchRequest(tiles[i], url);
                            }
                        } else {
                            this.result.featuresTotal += tileCache.remains;
                            this.manageFeaturesResponse(tileCache.features.slice(),tiles[i]);
                            this.updateGUI();
                        }*/

                    // Remove all feature outside view of tiles
                    this.doRemove = false;
                    if (this.lastRemovingDateTime === null) {
                        this.doRemove = true;
                    } else {
                        this.doRemove =
                            Date.now() - this.lastRemovingDateTime >=
                            this.removingDeltaSeconds * 1000;
                    }
                    if (this.doRemove) {
                        var viewExtent = this.getExtent(this.tiles);
                        this.lastRemovingDateTime = Date.now();
                        this.removeFeaturesOutside(viewExtent);
                    }
                }
            }
        };

        /**************************************************************************************************************/

        /**
         * Get extent from array of tiles
         * @function getExtent
         * @param {Array} tiless Array of tiles
         * @return {Json} Extent (north, south, east, west)
         * @memberof OpenSearchLayer#
         */

        OpenSearchLayer.prototype.getExtent = function (tiles) {
            var result = {
                east: -180,
                west: +180,
                north: -90,
                south: +90
            };
            var bound;
            for (var i = 0; i < tiles.length; i++) {
                bound = tiles[i].bound;
                result.south =
                    bound.south < result.south ? bound.south : result.south;
                result.north =
                    bound.north > result.north ? bound.north : result.north;
                result.east = bound.east > result.east ? bound.east : result.east;
                result.west = bound.west < result.west ? bound.west : result.west;
            }
            return result;
        };

        /**************************************************************************************************************/

        /**
         * Get geometry extent
         * @function getGeometryExtent
         * @param {Json} geometry Geometry
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.getGeometryExtent = function (geometry) {
            var result = {
                east: -180,
                west: +180,
                north: -90,
                south: +90
            };
            for (var i = 0; i < geometry.coordinates[0].length; i++) {
                coord = geometry.coordinates[0][i];
                result.south = coord[1] < result.south ? coord[1] : result.south;
                result.north = coord[1] > result.north ? coord[1] : result.north;
                result.east = coord[0] > result.east ? coord[0] : result.east;
                result.west = coord[0] < result.west ? coord[0] : result.west;
            }
            return result;
        };

        /**************************************************************************************************************/

        /**
         * Submit OpenSearch form
         * @function submit
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.submit = function () {
            this.getServices().queryForm.updateFromGUI();
            this.resetAll();
        };

        /**************************************************************************************************************/

        /**
         * @function setVisible
         * @memberof OpenSearchLayer#
         * @throws {TypeError} - The parameter of setVisible should be a boolean
         */
        OpenSearchLayer.prototype.setVisible = function (arg) {
            console.log("setVisible");
            if (typeof arg === "boolean") {
                // Change for current layer
                if (this.visible !== arg && this.getGlobe().attributionHandler) {
                    this.getGlobe().attributionHandler.toggleAttribution(this);
                }
                this.visible = arg;

                var linkedLayers = this.callbackContext.getLinkedLayers(this.ID);
                // Change for wms linked layers
                for (var i = 0; i < linkedLayers.length; i++) {
                    linkedLayers[i].setVisible(arg);
                }

                if (
                    typeof this.currentQuicklookLayer !== "undefined" &&
                    this.currentQuicklookLayer !== null
                ) {
                    //this.currentQuicklookLayer.setVisible(this.visible);
                    if (this.visible === false) {
                        this.removeQuicklook();
                    }
                }

                if (this.getGlobe()) {
                    this.getGlobe()
                        .getRenderContext()
                        .requestFrame();
                }
                this.publish(Constants.EVENT_MSG.LAYER_VISIBILITY_CHANGED, this);
            } else {
                throw new TypeError(
                    "the parameter of setVisible should be a boolean",
                    "AbstractLayer.js"
                );
            }
            console.log("/setVisible");
        };

        /**************************************************************************************************************/

        /**
            /**
             * @function setOpacity
             * @memberof OpenSearchLayer#
             * @throws {RangeError} opacity - opacity value should be a value in [0..1]
             */
        OpenSearchLayer.prototype.setOpacity = function (arg) {
            if (typeof arg === "number" && arg >= 0.0 && arg <= 1.0) {
                var targetStyle = new FeatureStyle(this.getStyle());
                targetStyle.setOpacity(arg);

                for (var i = 0; i < this.features.length; i++) {
                    this.modifyFeatureStyle(this.features[i], targetStyle);
                }

                var linkedLayers = this.callbackContext.getLinkedLayers(
                    this.getID()
                );
                // Change for wms linked layers
                for (i = 0; i < linkedLayers.length; i++) {
                    linkedLayers[i].getStyle().setOpacity(arg);
                }

                AbstractLayer.prototype.setOpacity.call(this, arg);
            } else {
                throw new RangeError(
                    "opacity value should be a value in [0..1]",
                    "AbstractLayer.js"
                );
            }
        };

        /**************************************************************************************************************/

        /**
         * Reset pool, cache and all OpenSearch data loaded
         * @function resetAll
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.resetAll = function () {
            // Reset pool
            this.pool.resetPool();
            // Reset cache
            this.cleanCache();
            // Remove all features
            this.removeFeatures();
        };

        /**************************************************************************************************************/

        /**
         * Clean the cache
         * @function cleanCache
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.cleanCache = function () {
            this.cache.reset();
            this.previousViewKey = null;
        };

        /**************************************************************************************************************/

        /**
         * Update the GUI (mainly debug purpose)
         * @function updateGUI
         * @memberof OpenSearchLayer#
         */
        OpenSearchLayer.prototype.updateGUI = function () {
            var message = "";
            message +=
                "<a href='javascript:document.currentOpenSearchLayer.resetAll();'>Reset</a><br>";
            message +=
                "<a href='javascript:document.currentOpenSearchLayer.nextPage();'>Next</a><br>";
            message += "# Features : " + this.features.length + "<br>";
            message += this.pool.getPoolsStatus() + "<br>";
            message += this.cache.getCacheStatus();
        };

        /**************************************************************************************************************/

        /**
         * Check is feature still added to global render
         * @function featureStillAdded
         * @memberof OpenSearchLayer#
         * @param {String} featureId Feature id
         * @private
         */
        OpenSearchLayer.prototype.featureStillAdded = function (featureId) {
            var num = this.featuresIdLoaded.indexOf(featureId);

            return num >= 0;
        };

        /**
         * Check is feature still added to tile
         * @function featureStillAddedToTile
         * @memberof OpenSearchLayer#
         * @param {String} featureId Feature id
         * @param {Tile} tile Tile
         * @private
         */
        OpenSearchLayer.prototype.featureStillAddedToTile = function (
            featureId,
            tile
        ) {
            if (typeof tile.associatedFeaturesId.length === "undefined") {
                return false;
            }

            var num = tile.associatedFeaturesId.indexOf(featureId);

            return num >= 0;
        };

        /**************************************************************************************************************/

        /**
         * Load WMS layer
         * @function loadWMS
         * @memberof OpenSearchLayer#
         * @param {Json} selectedData Selected data
         * @fires OpenSearchLayer#toggleWMS
         */
        OpenSearchLayer.prototype.loadWMS = function (selectedData) {
            var extent = this.getGeometryExtent(selectedData.feature.geometry);
            var endpoint =
                selectedData.feature.properties.services.browse.layer.url;
            var name = selectedData.layer.name + " (WMS)";
            var layerDescription = {
                type: "WMS",
                name: name,
                baseUrl: endpoint,
                onlyFirst: true,
                format: "image/png",
                visible: true,
                restrictTo: extent,
                background: false,
                linkedTo: selectedData.layer.ID
            };
            var self = this;
            selectedData.layer.callbackContext.addLayer(layerDescription, function (
                layerID
            ) {
                // Add feature id of wms into list a current WMS displayed
                self.addServicesRunningOnRecord(selectedData.feature.id, layerID);

                if (typeof self.callbackContext !== "undefined") {
                    self.callbackContext.publish(
                        Constants.EVENT_MSG.LAYER_TOGGLE_WMS,
                        {
                            layer_name: selectedData.layer.getShortName(),
                            visible: true
                        }
                    );
                }
            });
        };

        /**************************************************************************************************************/

        /**
         * Unload all WMS layer
         * @function unloadAllWMS
         * @memberof OpenSearchLayer#
         * @fires OpenSearchLayer#toggleWMS
         */
        OpenSearchLayer.prototype.unloadAllWMS = function () {
            this.removeServicesRunningOnRecords();
            this.removeServicesRunningOnCollection();

            this.callbackContext.refresh();

            if (typeof this.callbackContext !== "undefined") {
                if (typeof selectedData !== "undefined") {
                    this.callbackContext.publish(
                        Constants.EVENT_MSG.LAYER_TOGGLE_WMS,
                        {
                            layer_name: selectedData.layer.getShortName(),
                            visible: false
                        }
                    );
                }
            }
        };

        /**************************************************************************************************************/

        /**
         * Unload WMS layer
         * @function unloadWMS
         * @memberof OpenSearchLayer#
         * @param {Json} selectedData Selected data
         * @fires OpenSearchLayer#toggleWMS
         */
        OpenSearchLayer.prototype.unloadWMS = function (selectedData) {
            // Remove feature id
            this.removeServicesRunningOnRecord(selectedData.feature.id);

            selectedData.layer.callbackContext.refresh();

            if (typeof this.callbackContext !== "undefined") {
                this.callbackContext.publish(Constants.EVENT_MSG.LAYER_TOGGLE_WMS, {
                    layer_name: selectedData.layer.getShortName(),
                    visible: false
                });
            }
        };

        OpenSearchLayer.prototype.getFeatureById = function (featureId) {
            for (var i = 0; i < this.features.length; i++) {
                if (this.features[i].id === featureId) {
                    return this.features[i];
                }
            }
            return null;
        };

        OpenSearchLayer.prototype.getFeatureIndexById = function (featureId) {
            for (var i = 0; i < this.features.length; i++) {
                if (this.features[i].id === featureId) {
                    return i;
                }
            }
            return -1;
        };

        OpenSearchLayer.prototype.updateFeatureListWithTile = function (
            featureId,
            tile
        ) {
            var feature = this.getFeatureById(featureId);
            if (feature === null) {
                // Feature not found...no action
                return;
            }

            // Creation of list of associated tiles to keep trace of feature by tile
            if (typeof feature.associatedTiles === "undefined") {
                feature.associatedTiles = [];
            }

            // Make key value for tile
            var key = this.cache.getKey(tile.bound);

            if (feature.associatedTiles.indexOf(key) >= 0) {
                // still aded !
            } else {
                // add it
                feature.associatedTiles.push(key);
            }
        };
        /**************************************************************************************************************/
        /**
         * Manage a response to OpenSearch query
         * @function manageFeaturesResponse
         * @memberof OpenSearchLayer#
         * @param {Array} features Array of features loaded
         * @param {Tile} tile Tile
         * @fires OpenSearchLayer#updateStatsAttribute
         */
        OpenSearchLayer.prototype.manageFeaturesResponse = function (
            features,
            tile
        ) {
            this.updateFeatures(features);

            this.result.featuresLoaded += features.length;

            // Init array of feature id associated to tile
            if (
                tile.associatedFeaturesId === null ||
                typeof tile.associatedFeaturesId === "undefined"
            ) {
                tile.associatedFeaturesId = [];
            }

            // For each feature...
            for (i = features.length - 1; i >= 0; i--) {
                var feature = features[i];

                if (!feature.hasOwnProperty("id")) {
                    feature.id = feature.properties.identifier;
                }

                // Check if feature still globaly added ? (even on another tile)
                var alreadyAdded = this.featureStillAdded(feature.id);
                var alreadyAddedToTile = false;
                if (alreadyAdded) {
                    // Check if still added into this tile
                    alreadyAddedToTile = this.featureStillAddedToTile(
                        feature.id,
                        tile
                    );
                    if (alreadyAddedToTile === true) {
                        // Nothing to do !
                    } else {
                        tile.associatedFeaturesId.push(feature.id);
                        this.updateFeatureListWithTile(feature.id, tile);
                    }
                } else {
                    this.addFeature(feature);
                    tile.associatedFeaturesId.push(feature.id);
                    this.updateFeatureListWithTile(feature.id, tile);
                }
                features.splice(i, 1);
            }

            if (typeof this.callbackContext !== "undefined") {
                this.callbackContext.publish(
                    Constants.EVENT_MSG.LAYER_UPDATE_STATS_ATTRIBUTES,
                    {
                        shortName: this.getShortName(),
                        nb_loaded: this.features.length,
                        nb_total: this.result.featuresTotal
                    }
                );
            }

            // Only if tile was LOADING...
            if (tile.osState[this.getID()] === OpenSearchLayer.TileState.LOADING) {
                // ...set to LOADED
                tile.osState[this.getID()] = OpenSearchLayer.TileState.LOADED;
            }

            this.getGlobe().refresh();
        };

        /**************************************************************************************************************/

        /**
         * Update features
         * @function updateFeatures
         * @memberof OpenSearchLayer#
         * @param {Array} features Array of features
         * @private
         */
        OpenSearchLayer.prototype.updateFeatures = function (features) {
            for (var i = 0; i < features.length; i++) {
                var currentFeature = features[i];

                if (currentFeature.geometry) {
                    switch (currentFeature.geometry.type) {
                        case Constants.GEOMETRY.Point:
                            // Convert to geographic to simplify picking
                            if (currentFeature.geometry.coordinates[0] > 180) {
                                currentFeature.geometry.coordinates[0] -= 360;
                            }
                            break;
                        case Constants.GEOMETRY.Polygon:
                            var ring = currentFeature.geometry.coordinates[0];
                            for (var j = 0; j < ring.length; j++) {
                                // Convert to geographic to simplify picking
                                if (ring[j][0] > 180) {
                                    ring[j][0] -= 360;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        };

        /*************************************************************************************************************/

        return OpenSearchLayer;
    });
