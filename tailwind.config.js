/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: [
      'light',
      'dark',
      'dim',
      {
        solarized: {
          primary: '#2aa198',
          secondary: '#268bd2',
          accent: '#d33682',
          neutral: '#93a1a1',
          'base-100': '#002b36',
          info: '#6c71c4',
          success: '#859900',
          warning: '#cb4b16',
          error: '#dc322f'
        }
      }
    ]
  },
  plugins: [require('daisyui')]
};
