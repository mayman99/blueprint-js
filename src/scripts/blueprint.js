import { Configuration, configDimUnit } from "./core/configuration";
import { dimCentiMeter } from "./core/constants";
import { Model } from "./model/model";
import { Viewer3D } from "./viewer3d/Viewer3d";
import { Viewer2D, floorplannerModes } from "./viewer2d/Viewer2D";
import { ConfigurationHelper } from "./helpers/ConfigurationHelper";
import { FloorPlannerHelper } from "./helpers/FloorplannerHelper";
import { RoomPlannerHelper } from "./helpers/RoomplannerHelper";

///** BlueprintJS core application. */
class BlueprintJS {
    /**
     * Creates an instance of BlueprintJS. This is the entry point for the application
     *
     * @param {Object} - options The initialization options.
     * @param {string} options.floorplannerElement - Id of the html element to use as canvas. Needs to exist in the html
     * @param {string} options.threeElement - Id of the html element to use as canvas. Needs to exist in the html and should be #idofhtmlelement
     * @param {string} options.threeCanvasElement - Id of the html element to use as threejs-canvas. This is created automatically
     * @param {string} options.textureDir - path to texture directory. No effect
     * @param {boolean} options.widget - If widget mode then disable the controller from interactions
     * @example
     * let blueprint3d = new BP3DJS.BlueprintJS(opts);
     */
    constructor(options) {
        Configuration.setValue(configDimUnit, dimCentiMeter);

        // console.log('BLUEPRINT JS :: OPTIONS ::: ', options);

        /**
         * @property {Object} options
         * @type {Object}
         **/
        this.options = options;
        /**
         * @property {Model} model
         * @type {Model}
         **/
        this.model = new Model(options.textureDir);
        /**
         * @property {Main} three
         * @type {Main}
         **/
        // this.three = new Main(this.model, options.threeElement, options.threeCanvasElement, {});
        /**
         * @property {Main} three
         * @type {Main}
         **/
        let viewer3dOptions = this.options.viewer3d.viewer3dOptions || {};

        // console.log('OPTIONS ::: ', this.options);
        viewer3dOptions.resize = (this.options.resize) ? true : false;
        this.roomplanner = new Viewer3D(this.model, options.viewer3d.id, viewer3dOptions);

        this.configurationHelper = new ConfigurationHelper();
        this.floorplanningHelper = null;
        this.roomplanningHelper = new RoomPlannerHelper(this.model, this.model.floorplan, this.roomplanner);
        if (!options.widget) {
            /**
             * @property {Floorplanner2D} floorplanner
             * @type {Floorplanner2D}
             **/
            // this.floorplanner = new Floorplanner2D(options.floorplannerElement, this.model.floorplan);
            let viewer2dOptions = this.options.viewer2d.viewer2dOptions || {};
            viewer2dOptions.resize = (this.options.resize) ? true : false;
            this.floorplanner = new Viewer2D(options.viewer2d.id, this.model.floorplan, viewer2dOptions);
            this.floorplanningHelper = new FloorPlannerHelper(this.model.floorplan, this.floorplanner);
        }

        this.view_now = 3;
        this.switchView();
    }
    hideViewers() {
        if (this.options.widget) {
            return;
        }
        document.getElementById(this.options.viewer2d.id).style.visibility = "hidden";//
        document.getElementById(this.options.viewer3d.id).style.visibility = "hidden";
        this.roomplanner.enabled = false;
    }

    hideSideTiles() {
        document.getElementById("right_tile").style.visibility = "hidden";
        document.getElementById("left_tile").style.visibility = "hidden";
    }

    showLoadingScreen() {
        const y_2 = document.getElementById("loader");
        y_2.style.visibility = "visible";
    }

    hideLoadingScreen() {
        const y_2 = document.getElementById("loader");
        y_2.style.visibility = "hidden";
    }

    switchView() {
        if (this.options.widget) {
            return;
        }
        this.floorplanner.switchMode(floorplannerModes.MOVE);
        if (this.view_now === 3 && !this.options.widget) {
            this.view_now = 2;
            // document.getElementById("buttons_viewer_3d").style.visibility = "hidden";//
            // document.getElementById("buttons-drawing").style.visibility = "visible";//
            document.getElementById(this.options.viewer2d.id).style.visibility = "visible";
            document.getElementById(this.options.viewer3d.id).style.visibility = "hidden";
            this.roomplanner.enabled = false;
        } else if (this.view_now === 2 && !this.options.widget) {
            this.view_now = 3;
            // document.getElementById("buttons-drawing").style.visibility = "hidden";//
            // document.getElementById("buttons_viewer_3d").style.visibility = "visible";//
            document.getElementById(this.options.viewer2d.id).style.visibility = "hidden";//
            document.getElementById(this.options.viewer3d.id).style.visibility = "visible";//"hidden";//
            this.roomplanner.enabled = true;
        }
    }

    switchTo2D() {
        this.view_now = 2;
        document.getElementById("2d_draw_buttons_list").style.visibility = "visible";//
        document.getElementById("3d_draw_buttons_list").style.visibility = "hidden";//
        document.getElementById("send_points_div").style.visibility = "hidden";//

        document.getElementById("current_subtitle").textContent = "Drawing a Bedroom floorplan";

        document.getElementById(this.options.viewer2d.id).style.visibility = "visible";
        document.getElementById(this.options.viewer3d.id).style.visibility = "hidden";
        this.roomplanner.enabled = true;
    }

    switchTo3D() {
        this.view_now = 3;
        document.getElementById("2d_draw_buttons_list").style.visibility = "hidden";//
        document.getElementById("3d_draw_buttons_list").style.visibility = "visible";//
        document.getElementById("send_points_div").style.visibility = "visible";//

        // document.getElementById("current_subtitle").textContent = "Adding doors and windowsto design";

        document.getElementById(this.options.viewer2d.id).style.visibility = "hidden";//
        document.getElementById(this.options.viewer3d.id).style.visibility = "visible";//"hidden";//
        this.roomplanner.enabled = true;
    }

    setViewer2DModeToDraw(mode) {
        // let draw_mode = document.getElementById('draw_mode');
        // let move_mode = document.getElementById('move_mode');
        // draw_mode.disabled = true;
        // move_mode.disabled = false;
        if (this.options.widget) {
            return;
        }
        this.floorplanner.switchMode(floorplannerModes.DRAW);
    }

    setViewer2DModeToMove(mode) {
        // let draw_mode = document.getElementById('draw_mode');
        // let move_mode = document.getElementById('move_mode');
        // move_mode.disabled = true;
        // draw_mode.disabled = false;
        if (this.options.widget) {
            return;
        }
        this.floorplanner.switchMode(floorplannerModes.MOVE);
    }

    switchViewer2DToTransform(mode) {
        if (this.options.widget) {
            return;
        }
        this.floorplanner.switchMode(floorplannerModes.EDIT_ISLANDS);
    }

    updateView3D() {
        this.viewer3d.needsUpdate = true;
    }

    get currentView() {
        return this.view_now;
    }
}
export { BlueprintJS };