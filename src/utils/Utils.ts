// faz uma string cammel case
export const toCamel = (s: string) => {
    return s.replace(/([-_][a-z])/gi, w => {
        return w.toUpperCase().replace('-', '').replace('_', '');
    });
};
