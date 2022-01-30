import { createTheme, darken } from '@mui/material';

export const light = '#e6e9d9';
export const main = darken('#e6e9d9', 0.45);
export const dark = darken('#e6e9d9', 0.65);

export const theme = createTheme({
    palette: {
        primary: {
            light: '#e6e9d9',
            main: darken('#e6e9d9', 0.45),
            dark: darken('#e6e9d9', 0.65),
        },
    },
    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                },
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});
