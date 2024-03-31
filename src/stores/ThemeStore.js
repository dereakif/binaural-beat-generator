import { writable } from 'svelte/store';

const Theme = writable({
  name: '',
  primary: '',
  secondary: ''
});

export default Theme;
