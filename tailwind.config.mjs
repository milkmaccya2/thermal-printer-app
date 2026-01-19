/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			spacing: {
				'printer': '576px', // useful alias
			},
            screens: {
                'print': '576px',
            }
		},
	},
	plugins: [],
};
