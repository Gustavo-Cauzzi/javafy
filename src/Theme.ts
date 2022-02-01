import { darken, lighten } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export const lightColor = '#e6e9d9';
export const mainColor = darken('#e6e9d9', 0.45);
export const darkColor = darken('#e6e9d9', 0.65);

const AutocompletePopperStyles = {
    backgroundColor: lighten(lightColor, 0.25),
    fontSize: '13px',
    color: 'rgba(0, 0, 0, 0.64)',
    '&.MuiAutocomplete-loading': {
        fontWeight: 'bold',
    },
    '&::-webkit-scrollbar': {
        width: '10px',
    },

    '&::-webkit-scrollbar-track': {
        background: lighten(lightColor, 0.25),
    },

    '&::-webkit-scrollbar-thumb': {
        background: '#b3b3b3',
        borderRadius: '10px',
    },

    '&::-webkit-scrollbar-thumb:hover': {
        background: '#9e9e9e',
    },
};

export const theme = createTheme({
    palette: {
        primary: {
            light: lightColor,
            main: mainColor,
            dark: darkColor,
        },
    },
    components: {
        MuiAutocomplete: {
            styleOverrides: {
                listbox: AutocompletePopperStyles,
                noOptions: AutocompletePopperStyles,
                loading: AutocompletePopperStyles,
                inputRoot: {
                    padding: '4px 12px',
                    paddingBottom: '4px !important',
                },
                root: {
                    '& .MuiAutocomplete-inputRoot:not(.Mui-disabled) .MuiAutocomplete-endAdornment': {
                        svg: {
                            color: mainColor,
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
