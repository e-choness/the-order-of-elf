// The Order of E.L.F. — web edition entry point.
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/nunito';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/special-elite';
import '@fontsource/mountains-of-christmas/700.css';
import './ui/styles.css';

async function start() {
  const root = document.getElementById('app')!;
  if (location.hash.startsWith('#validate')) {
    const { validateAll } = await import('./dev/validate');
    (window as any).__validation = await validateAll();
    return;
  }
  if (location.hash.startsWith('#viewer')) {
    const { runViewer } = await import('./dev/viewer');
    await runViewer();
    return;
  }
  const { App } = await import('./ui/app');
  const app = new App(root);
  (window as any).__app = app;
  (window as any).__THREE = await import('three');
  await app.boot();
}

start();
