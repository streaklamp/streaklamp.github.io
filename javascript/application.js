import { Application } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
import StreakController from "./controllers/streak_controller.js";

const application = Application.start();

application.register("streak", StreakController);
