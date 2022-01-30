import { Button, Checkbox, Radio, Switch, TextField, ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import CustomSwitch from './shared/components/CustomSwitch';
import { theme } from './Theme';

const App: React.FC = () => {
  const [javafy, setJavafy] = useState(true);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  const handleJavafy = () => {
    const splitedByLine = text1.split('\n');
    let biggestLine = 0;
    let leastAmountOfSpacesAtTheBegining = Infinity;

    splitedByLine.forEach(line => {
      if (line.length > biggestLine) biggestLine = line.length;

      if (leastAmountOfSpacesAtTheBegining === 0) return;

      let spaceTestIndex = 0;
      while (line.length !== 0 && line[spaceTestIndex] === ' ') spaceTestIndex++;
      if (leastAmountOfSpacesAtTheBegining > spaceTestIndex) leastAmountOfSpacesAtTheBegining = spaceTestIndex;
    });

    const squaredQuery = splitedByLine.map(line => {
      const newLine = line.padEnd(biggestLine, ' ');
      const splited = newLine.split('');
      splited.splice(0, leastAmountOfSpacesAtTheBegining);
      return splited.join('');
    });

    const sqledLine = squaredQuery.map(line => `sql.append(" ${line} ");`);

    const finalProductArrayed = [
      'StringBuilder sql = new StringBuilder();',
      '',
      ...sqledLine,
      '',
      'Query query = em.createNativeQuery(sql.toString(), Tuple.class);',
    ];

    const finalProduct = finalProductArrayed.join('\n');

    setText2(finalProduct);
  };

  const handleSQLify = () => {
    const value = text1
      .replaceAll('StringBuilder sql = new StringBuilder();', '')
      .replaceAll('sql.append("', '')
      .replaceAll('");', '')
      .replaceAll('Query query = em.createNativeQuery(sql.toString(), Tuple.class);', '');

    setText2(value.trim());
  };

  const changeJavafy = () => {
    if (text1 && text2) {
      const aux = text1;
      setText1(text2);
      setText2(aux);
    }
    setJavafy(state => !state);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="py-10 flex w-full justify-center items-center flex-col">
        <h1 className="text-3xl">{javafy ? 'Javafy SQL' : 'SQLify Java'}</h1>
        <h3 className="text-lg">
          or try{' '}
          <a onClick={changeJavafy} className="cursor-pointer hover:underline font-bold">
            {javafy ? 'Sqlfy' : 'Javafy'}
          </a>
        </h3>
      </div>

      <div className="flex w-full justify-around px-10 flex-col gap-5 lg:flex-row">
        <TextField
          value={text1}
          multiline
          fullWidth
          minRows={15}
          onChange={e => setText1(e.target.value)}
          placeholder={javafy ? 'Paste your sql here' : 'Paste your java here'}
        ></TextField>
        <div className="flex flex-row lg:flex-col justify-around lg:justify-start w-full items-center sm:max-w-24 gap-7 px-2 py-4">
          <Button variant="contained" onClick={javafy ? handleJavafy : handleSQLify}>
            {javafy ? 'Javafy' : 'SQLify'}!
          </Button>

          <div className="flex items-center lg:flex-col">
            {javafy ? 'SQLify' : <b>SQLify</b>}
            <div className="flex lg:rotate-90 lg:transform-gpu lg:my-1">
              <CustomSwitch checked={javafy} onChange={changeJavafy} />
            </div>
            {javafy ? <b>Javafy</b> : 'Javafy'}
          </div>
        </div>
        <TextField
          value={text2}
          onChange={e => setText2(e.target.value)}
          multiline
          fullWidth
          minRows={15}
          placeholder={javafy ? 'Here is your javafied query...' : 'Here is your SQL query...'}
        ></TextField>
      </div>
    </ThemeProvider>
  );
};

export default App;
