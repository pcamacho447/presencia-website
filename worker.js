import worker from './dist/_worker.js/index.js';

export default {
  async fetch(request, env, ctx) {
    try {
      return await worker.fetch(request, env, ctx);
    } catch (err) {
      return new Response(
        `[CRITICAL WORKER EXCEPTION]\nMessage: ${err?.message || err}\nStack:\n${err?.stack || 'No stack trace'}\n\nEnv keys: ${Object.keys(env || {}).join(', ')}`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }
  },
};
