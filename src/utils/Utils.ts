// faz uma string cammel case
export const toCamel = (s: string) =>
    s.replace(/([-_][a-z])/gi, w => {
        return w.toUpperCase().replace('-', '').replace('_', '');
    });

const detectParamSymbol = (param: string) => {
    if (param.includes(':')) return ':';
    if (param.includes('&')) return '&';
    return '';
};

// par_id_restaurante - ERRADO
// par_idRestaurante - CERTO
// standardizeParamsInQuery corrige todos os parametros para ficarem no padrão
export const standardizeParamsInQuery = (str: string) =>
    str
        .split(' ')
        .map(word => {
            if (!word.includes('par_')) return word;

            const hasInitialParenthesis = word[0] === '(' ? '(' : '';
            const hasFinalParenthesis = word[word.length - 1] === ')' ? ')' : '';
            const symbol = detectParamSymbol(word);
            const newParamName = toCamel(word.split('par_')[1]);
            return `${hasInitialParenthesis}${symbol}par_${newParamName}${hasFinalParenthesis}`;
        })
        .join(' ');

export const getMainTableName = (sql: string): null | string => {
    let selectDepth = 0;
    let tableName = null;
    const wordByWord = sql
        .split('')
        .filter(word => word !== ')' && word !== '(')
        .join('')
        .split(' ');

    for (let index = 0; index < wordByWord.length; index++) {
        const word = wordByWord[index];
        if (word.toLowerCase() === 'select') selectDepth++;
        else if (word.toLowerCase() === 'from') {
            selectDepth--;
            if (!selectDepth) {
                tableName = wordByWord[index + 1] ?? null;
            }
        }
    }

    console.log('tableName: ', tableName);
    return tableName;
};

export const indentStringWithTab = (str: string, numOfTabs: number) => {
    const tab = '    ';
    let tabInsert = '';

    for (let i = 1; i <= numOfTabs; i++) tabInsert += tab;

    return str
        .split('\n')
        .map(line => tabInsert + line)
        .join('\n');
};
