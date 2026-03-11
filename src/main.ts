import { initStrudel } from './strudel/bridge';
import { GenerativeController } from './engine/generative-controller';
import { setupUI } from './ui/controls';
import { Visualizer } from './ui/visualizer';
import { Dashboard } from './ui/dashboard';

const app = document.getElementById('app')!;
const controller = new GenerativeController();
const visualizer = new Visualizer(document.body);
const dashboard = new Dashboard(controller);

const { updateState } = setupUI(app, {
  onPlay: async () => {
    await initStrudel();
    await controller.start();
    visualizer.start();
  },
  onStop: () => {
    controller.stop();
    visualizer.stop();
  },
  onMoodChange: (mood) => {
    controller.setMood(mood);
  },
  onDensity: (v) => controller.setDensity(v),
  onBrightness: (v) => controller.setBrightness(v),
  onSpaciousness: (v) => controller.setSpaciousness(v),
  onForceChord: () => controller.forceNextChord(),
  onForceSection: () => controller.forceNextSection(),
});

controller.setStateChangeCallback((state) => {
  updateState(state);
  visualizer.update(state);
  dashboard.updateState(state);
});
