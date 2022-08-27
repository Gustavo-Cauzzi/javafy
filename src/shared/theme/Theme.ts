import { createTheme, darken, lighten, rgbToHex } from '@mui/material';
import { Mode } from '../../hooks/mode';

export const lightColor = '#e6e9d9';
export const mainColor = darken('#e6e9d9', 0.45);
export const darkColor = darken('#e6e9d9', 0.65);

const lightPalette = {
    primary: {
        light: lightColor,
        main: mainColor,
        dark: darkColor,
    },
    background: { default: '#e6e9d9' },
};

const darkPalette = {
    primary: {
        light: '#e5e5e5',
        main: darken('#e5e5e5', 0.45),
        dark: darken('#e5e5e5', 0.65),
    },
    background: { default: '#2B2C29' },
};

const isDarkMode = (mode: Mode) => mode === 'dark';
const getCurrentPallete = (mode: Mode) => (isDarkMode(mode) ? { mode, ...darkPalette } : { mode, ...lightPalette });

const AutocompletePopperStyles = (mode: Mode) => ({
    backgroundColor: lighten(getCurrentPallete(mode).background.default, 0.1),
    fontSize: '13px',
    color: isDarkMode(mode) ? 'rgba(255, 255, 255, 0.64)' : 'rgba(0, 0, 0, 0.64)',
    '&.MuiAutocomplete-loading': {
        fontWeight: 'bold',
    },
    '&::-webkit-scrollbar': {
        width: '10px',
    },

    '&::-webkit-scrollbar-track': {
        background: lighten(getCurrentPallete(mode).background.default, 0.25),
    },

    '&::-webkit-scrollbar-thumb': {
        background: lighten(getCurrentPallete(mode).primary.light, 0.4),
        borderRadius: '10px',
    },

    '&::-webkit-scrollbar-thumb:hover': {
        background: lighten(getCurrentPallete(mode).primary.light, 0.5),
    },
});

export const theme = (mode: Mode) =>
    createTheme({
        palette: getCurrentPallete(mode),
        components: {
            MuiTooltip: {
                defaultProps: {
                    arrow: true,
                    placement: 'top',
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    listbox: AutocompletePopperStyles(mode),
                    noOptions: AutocompletePopperStyles(mode),
                    loading: AutocompletePopperStyles(mode),
                    inputRoot: {
                        padding: '4px 12px',
                        paddingBottom: '4px !important',
                    },
                    root: {
                        '& .MuiAutocomplete-inputRoot:not(.Mui-disabled) .MuiAutocomplete-endAdornment': {
                            svg: {
                                color: isDarkMode(mode)
                                    ? getCurrentPallete(mode).primary.light
                                    : getCurrentPallete(mode).primary.dark,
                            },
                        },
                        '.MuiAutocomplete-popper': {
                            '.MuiPaper-root': {
                                borderBottomLeftRadius: '15px',
                                borderBottomRightRadius: '15px',
                            },
                        },
                    },
                },
            },
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
