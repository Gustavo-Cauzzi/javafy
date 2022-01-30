module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            transitionProperty: {
                filter: 'filter',
            },
            maxWidth: {
                24: '6rem',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
