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
define(function() {
    var Constants = function() {};

    /**
     * @namespace
     * ANIMATION
     * @property {String} Inertia - Inertia animation
     * @property {String} Interpolated - Interpolated animation
     * @property {String} Path - Path animation
     * @property {String} Segmented - Segmented animation
     */
    Constants.ANIMATION = {
        Inertia: "Inertia",
        Interpolated: "Interpolated",
        Path: "Path",
        Segmented: "Segmented"
    };

    /**
     * @namespace
     * CONTEXT
     * @property {String} Planet - Planet context
     * @property {String} Sky - Sky context
     * @property {String} Ground - Ground context
     */
    Constants.CONTEXT = {
        Planet: "Planet",
        Sky: "Sky",
        Ground: "Ground"
    };

    /**
     * @namespace
     * GLOBE
     * @property {String} Planet - Planet
     * @property {String} Sky - Sky
     */
    Constants.GLOBE = {
        Planet: "Planet",
        Sky: "Sky"
    };

    /**
     * @namespace
     * LAYER
     * @property {String} WMS - Web Map Service
     * @property {String} WMTS - Web Map Tile Service
     * @property {String} WMSElevation - Web Map Service for elevation
     * @property {String} WCSElevation - Web Map Coverage for elevation
     * @property {String} GeoJSON - GeoJSON
     * @property {String} Vector - Vector
     * @property {String} Atmosphere - Atmosphere
     * @property {String} Bing - Microsoft BING
     * @property {String} GroundOverlay - GroundOverlay
     * @property {String} OSM - Open Street Map
     * @property {String} TileWireframe - TileWireframe
     * @property {String} HipsGrid - HipsGrid
     * @property {String} CoordinateGrid - CoordinateGrid
     * @property {String} Hips - Hierarchical Progressive Survey for images
     * @property {String} HipsCat - Hierarchical Progressive Survey for catalogue
     * @property {String} HipsFits - Hierarchical Progressive Survey for FITS
     * @property {String} Moc - Multiple Order Coverage
     * @property {String} OpenSearch - Open Search
     */
    Constants.LAYER = {
        AsynchroneWMS: "AsynchroneWMS",
        WMS: "WMS",
        WMTS: "WMTS",
        WMSElevation: "WMSElevation",
        WCSElevation: "WCSElevation",
        GeoJSON: "GeoJSON",
        Vector: "Vector",
        Atmosphere: "Atmosphere",
        Bing: "Bing",
        GroundOverlay: "GroundOverlay",
        OSM: "OSM",
        TileWireframe: "TileWireframe",
        HipsGrid: "HipsGrid",
        CoordinateGrid: "CoordinateGrid",
        HipsFits: "HipsFits",
        Hips: "Hips",
        HipsCat: "HipsCat",
        Moc: "Moc",
        OpenSearch: "OpenSearch"
    };

    /**
     * @namespace
     * GEOMETRY
     * @property {String} Point - Point
     * @property {String} MultiPoint - MultiPoint
     * @property {String} LineString - LineString
     * @property {String} MultiLineString - MultiLineString
     * @property {String} Polygon - Polygon
     * @property {String} MultiPolygon - MultiPolygon
     * @property {String} GeometryCollection - GeometryCollection
     */
    Constants.GEOMETRY = {
        Point: "Point",
        MultiPoint: "MultiPoint",
        LineString: "LineString",
        MultiLineString: "MultiLineString",
        Polygon: "Polygon",
        MultiPolygon: "MultiPolygon",
        GeometryCollection: "GeometryCollection"
    };

    /**
     * @namespace
     * PROJECTION
     * @property {String} Aitoff - Aitoff projection
     * @property {String} August - August projection
     * @property {String} Mercator - Mercator projection
     * @property {String} Mollweide - Mollweide projection
     * @property {String} Plate - Plate Carrée projection
     * @property {String} Azimuth - Azimuthal projection
     */
    Constants.PROJECTION = {
        Aitoff: "Aitoff",
        August: "August",
        Mercator: "Mercator",
        Mollweide: "Mollweide",
        Plate: "Plate Carrée",
        Azimuth: "Azimuth"
    };

    /**
     * @namespace
     * CRS
     * @property {String} Equatorial - Equatorial coordinate reference system
     * @property {String} Galactic - Galactic coordinate reference system
     * @property {String} WGS84 - CRS:84 coordinate reference system
     * @property {String} Mars_2000 - IAU2000:49901 coordinate reference system
     * @property {String} Mars_2000_old - IAU2000:49900 coordinate reference system
     * @property {String} Moon_2000 - IAU2000:30101 coordinate reference system
     * @property {String} Moon_2000_old - IAU2000:30100 coordinate reference system
     * @property {String} HorizontalLocal - Local reference system based on horizontal coordinates
     */
    Constants.CRS = {
        Equatorial: "Equatorial",
        Galactic: "Galactic",
        WGS84: "CRS:84",
        Mars_2000: "IAU2000:49901",
        Mars_2000_old: "IAU2000:49900",
        Moon_2000: "IAU2000:30101",
        Moon_2000_old: "IAU2000:30100",
        HorizontalLocal: "HorizontalLocal",
        Sun: "IAU:Sun"
    };

    /**
     * @namespace
     * NAVIGATION
     * @property {String} AstroNavigation - 3D Navigation for sky
     * @property {String} PlanetNavigation - 3D Navigation for planet
     * @property {String} FlatNavigation - 2D Navigation for planet
     * @property {String} GroundNavigation - 3D Navigation for ground visualization
     */
    Constants.NAVIGATION = {
        AstroNavigation: "AstroNavigation",
        PlanetNavigation: "PlanetNavigation",
        FlatNavigation: "FlatNavigation",
        GroundNavigation: "GroundNavigation"
    };

    /**
     * @namespace
     * SERVICE
     * @property {String} FitsVisu - FITS visualization
     * @property {String} Histogram - Histogram values from a FITS file
     * @property {String} ImageProcessing - Image processing
     * @property {String} MeasureToolSky - Tool to measure the distance between two points on the sky
     * @property {String} MeasureToolPlanet - Tool to measure the distance between two points on a planet
     * @property {String} MocBase - MOC service
     * @property {String} MollweideViewer - Mollweide Viewer
     * @property {String} PickingManager - Picking Manager
     * @property {String} Samp - Samp
     * @property {String} SelectionTool - Selection Tool
     * @property {String} NameResolver - NameResolver
     * @property {String} ReverseNameResolver - ReverseNameResolver
     * @property {String} ExportTool - ExportTool
     */
    Constants.SERVICE = {
        FitsHips: "FitsHips",
        FitsVisu: "FitsVisu",
        Histogram: "Histogram",
        ImageProcessing: "ImageProcessing",
        MeasureToolSky: "MeasureToolSky",
        MeasureToolPlanet: "MeasureToolPlanet",
        MocBase: "MocBase",
        MollweideViewer: "MollweideViewer",
        PickingManager: "PickingManager",
        Samp: "Samp",
        SelectionTool: "SelectionTool",
        NameResolver: "NameResolver",
        ReverseNameResolver: "ReverseNameResolver",
        ExportTool: "ExportTool",
        TimeTravel: "TimeTravel"
    };

    /**
     * @namespace
     * HANDLER
     * @property {String} Touch - Touch device
     * @property {String} Keyboard - Keyboard device
     * @property {String} Mouse - Mouse device
     * @property {String} GoogleMouse - GoogleMouse device
     */
    Constants.HANDLER = {
        Touch: "Touch",
        Keyboard: "Keyboard",
        Mouse: "Mouse",
        GoogleMouse: "GoogleMouse"
    };

    /**
     * @namespace
     * PROVIDER
     * @property {String} Constellation - Constellation
     * @property {String} Json - Json
     * @property {String} Planet - Planet
     * @property {String} Star - Star
     * @property {String} Trajectory - Trajectory
     */
    Constants.PROVIDER = {
        Constellation: "Constellation",
        Planet: "Planet",
        Star: "Star",
        Crater: "Crater",
        Trajectory: "Trajectory"
    };

    /**
     * @namespace
     * MappingCrsHips2Mizar
     * @property {String} equatorial - Equatorial
     * @property {String} galactic - Galactic
     * @property {String} ecliptic - Ecliptic
     * @property {String} horizontalLocal - Equatorial
     */
    Constants.MappingCrsHips2Mizar = {
        equatorial: "Equatorial",
        galactic: "Galactic",
        ecliptic: "Ecliptic",
        "mars-panstimson": "Equatorial",
        horizontalLocal: "Equatorial"
    };

    /**
     * @namespace
     * UTILITY
     * @property {String} Fits - Fits utility
     * @property {String} Intersection - Intersection utility
     * @property {String} CreateStyle - CreateStyle utility
     * @property {String} FeatureStyle - FeatureStyle utility
     */
    Constants.UTILITY = {
        Fits: "Fits",
        Intersection: "Intersection",
        Numeric: "Numeric",
        CreateStyle: "CreateStyle",
        FeatureStyle: "FeatureStyle"
    };

    /**
     * @namespace
     * ANIMATION_STATUS
     * @property {String} STOPPED - animation is stopped
     * @property {String} RUNNING - animation is running
     * @property {String} PAUSED - animation is paused
     */
    Constants.ANIMATION_STATUS = {
        STOPPED: "STOPPED",
        RUNNING: "RUNNING",
        PAUSED: "PAUSED"
    };

    /**
     * @namespace
     * EVENT_MSG
     * @property {String} PLUGIN_NOT_FOUND - Plugin not found
     * @property {String} MIZAR_MODE_TOGGLE - Mizar mode, one value among {Constants.CONTEXT}
     * @property {String} LAYER_BACKGROUND_ADDED - Background Layer added
     * @property {String} LAYER_BACKGROUND_CHANGED - Background Layer changed
     * @property {String} LAYER_ADDED - Layer added
     * @property {String} LAYER_REMOVED - Layer removed
     * @property {String} LAYER_VISIBILITY_CHANGED - Visibility Layer changed
     * @property {String} LAYER_OPACITY_CHANGED - Opacity Layer changed
     * @property {String} LAYER_START_LOAD - Overlay rasters or vectors start to load
     * @property {String} LAYER_END_LOAD - Overlay rasters  or vectors finish to load
     * @property {String} LAYER_START_BACKGROUND_LOAD - Background rasters start to load
     * @property {String} LAYER_END_BACKGROUND_LOAD - Background rasters finish to load
     * @property {String} BASE_LAYERS_ERROR - Error at the initialisation of layer to render
     * @property {String} BASE_LAYERS_READY - Initialisation of the rendering is fine
     * @property {String} CRS_MODIFIED - Coordinate reference system is modified
     * @property {String} NAVIGATION_STARTED - Navigation started
     * @property {String} NAVIGATION_ENDED - Navigation ended
     * @property {String} NAVIGATION_MODIFIED - Navigation modified
     * @property {String} NAVIGATION_CHANGED_DISTANCE - Distance of the camera from the planet has changed
     * @property {String} IMAGE_DOWNLOADED - Image downloaded
     * @property {String} IMAGE_REMOVED - Image removed
     * @property {String} IMAGE_ADDED - Image added
     * @property {String} FEATURED_ADDED - Feature added
     * @property {String} GLOBAL_TIME_REWIND - global time is rewinded
     * @property {String} GLOBAL_TIME_FORWARD - global time is forwarded
     * @property {String} GLOBAL_TIME_SET - global time is set,
     * @property {String} GLOBAL_TIME_CHANGED - global time has changed

     */
    Constants.EVENT_MSG = {
        PLUGIN_NOT_FOUND: "plugin:not_found",
        MIZAR_MODE_TOGGLE: "mizarMode:toggle",
        LAYER_BACKGROUND_ERROR: "backgroundLayer:error",
        LAYER_BACKGROUND_ADDED: "backgroundLayer:add",
        LAYER_BACKGROUND_CHANGED: "backgroundLayer:changed",
        LAYER_ADDED: "layer:added",
        LAYER_REMOVED: "layer:removed",
        LAYER_VISIBILITY_CHANGED: "visibility:changed",
        LAYER_OPACITY_CHANGED: "opacity:changed",
        LAYER_START_LOAD: "startLoad",
        LAYER_END_LOAD: "endLoad",
        LAYER_START_BACKGROUND_LOAD: "startBackgroundLoad",
        LAYER_END_BACKGROUND_LOAD: "endBackgroundLoad",
        LAYER_UPDATE_STATS_ATTRIBUTES: "updateStatsAttribute",
        LAYER_TOGGLE_WMS: "toggleWMS",
        BASE_LAYERS_ERROR: "baseLayersError",
        BASE_LAYERS_READY: "baseLayersReady",
        CRS_MODIFIED: "modifiedCrs",
        NAVIGATION_STARTED: "startNavigation",
        NAVIGATION_ENDED: "endNavigation",
        NAVIGATION_MODIFIED: "modifiedNavigation",
        NAVIGATION_CHANGED_DISTANCE: "navigation:changedDistance",
        IMAGE_DOWNLOADED: "image:downloaded",
        IMAGE_REMOVED: "image:removed",
        IMAGE_ADDED: "image:added",
        FEATURED_ADDED: "features:added",
        GLOBAL_TIME_REWIND: "globalTime:rewind",
        GLOBAL_TIME_FORWARD: "globalTime:forward",
        GLOBAL_TIME_SET: "globalTime:set",
        GLOBAL_TIME_CHANGED: "globalTime:changed" // temporary, need to be link to LAYERS_TIME_CHANGED after dev
    };

    /**
     * @namespace
     * DISPLAY_ORDER
     * @property {String} RENDERING - Special rendering index
     * @property {String} DEFAULT_RASTER - Default layer index (specially images)
     * @property {String} SELECTED_RASTER - Selected layer index (specially images)
     * @property {String} DEFAULT_VECTOR - Default vector index
     * @property {String} SELECTED_VECTOR - Selected vector index
     * @property {String} SERVICE_VECTOR - Service index
     */
    Constants.DISPLAY = {
        RENDERING: -1,
        DEFAULT_RASTER: 0,
        SELECTED_RASTER: 10,
        DEFAULT_VECTOR: 20,
        SELECTED_VECTOR: 30,
        SERVICE_VECTOR: 40
    };

    /**
     * @namespace
     * INFORMATION_TYPE
     * @property {String} ATMOSPHERE - atmosphere data
     * @property {String} RASTER - raster data
     * @property {String} VECTOR - vector data
     */
    Constants.INFORMATION_TYPE = {
        ATMOSPHERE: "ATMOSPHERE",
        RASTER: "RASTER",
        VECTOR: "VECTOR"
    };

    /**
     * @namespace
     * TIME_STEP
     * @property {String} YEAR - years
     * @property {String} QUARTER - quarters
     * @property {String} MONTH - months
     * @property {String} WEEK - weeks
     * @property {String} DAY - days
     * @property {String} HOUR - hours
     * @property {String} MINUTE - minutes
     * @property {String} SECOND - seconds
     * @property {String} MILLISECOND - milliseconds
     * @property {String} ENUMERATED - null                                
     */
    Constants.TIME_STEP = {
        YEAR: "years",
        QUARTER: "quarters",
        MONTH: "months",
        WEEK: "weeks",
        DAY: "days",
        HOUR: "hours",
        MINUTE: "minutes",
        SECOND: "seconds",
        MILLISECOND: "milliseconds",
        ENUMERATED: null
    };

    /**
     * @namespace
     * TIME_MOMENT_STEP
     * @property {String} YEAR - year
     * @property {String} MONTH - month
     * @property {String} DAY - day
     * @property {String} HOUR - hour
     * @property {String} MINUTE - minute
     * @property {String} SECOND - second      
     */    
    Constants.TIME_MOMENT_STEP = {
        YEAR: "year",
        MONTH: "month",
        DAY: "day",
        HOUR: "hour",
        MINUTE: "minute",
        SECOND: "second"
    };

    /**
     * @namespace
     * UNIT_TIME_WMS
     * @property {String} YEAR - Y
     * @property {String} MONTH - M
     * @property {String} DAY - D
     * @property {String} HOUR - H
     * @property {String} MINUTE - M
     * @property {String} SECOND - S      
     */     
    Constants.UNIT_TIME_WMS = {
        YEAR: "Y",
        MONTH: "M",
        DAY: "D",
        HOUR: "H",
        MINUTE: "M",
        SECONDE: "S"
    };

    /**
     * @namespace
     * UNIT_RESOLUTION_WMS
     * @property {String} TIME - PT
     * @property {String} NOT_TIME - P    
     */    
    Constants.UNIT_RESOLUTION_WMS = {
        TIME: "PT",
        NOT_TIME: "P"
    };

    /**
     * @namespace
     * TIME
     * @property {String} DEFAULT_FORMAT - Do MMM Y HH:mm
     */     
    Constants.TIME = {
        DEFAULT_FORMAT: "Do MMM Y HH:mm"
    };

    /**************************************************************************************************************/

    return Constants;
});
