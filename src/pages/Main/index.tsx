import { Button, IconButton, TextField, useTheme } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useMode } from '../../hooks/mode';
import CustomSwitch from '../../shared/components/CustomSwitch';
import { darkColor } from '../../shared/theme/Theme';

const Main: React.FC = () => {
  const theme = useTheme();

  const { setMode } = useMode();

  const [javafy, setJavafy] = useState(true);
  const [varName, setVarName] = useState('sql');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  const handleJavafy = () => {
    if (varName === '') {
      toast.error('I need to know the name of the variable 😢', {
        style: {
          border: `1px solid ${darkColor}`,
          color: darkColor,
          maxWidth: 600,
        },
        iconTheme: {
          primary: theme.palette.primary.dark,
          secondary: theme.palette.primary.light,
        },
        duration: 6000,
      });
      return;
    }

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

    const sqledLine = squaredQuery.map(line => `${varName}.append(" ${line} ");`);

    const finalProductArrayed = [`StringBuilder ${varName} = new StringBuilder();`, '', ...sqledLine];

    const finalProduct = finalProductArrayed.join('\n');

    setText2(finalProduct);
  };

  const handleSQLify = () => {
    const lineThatHasVar = text1.split('\n').filter(line => line.includes('.append("'));
    const detectedVar: string[] = [];
    if (lineThatHasVar.length > 0) {
      lineThatHasVar.forEach(line => {
        const appendSplitted = line.split('.append("')[0];
        if (appendSplitted.includes(' ')) {
          detectedVar.push(appendSplitted);
        } else {
          const splittedBySpace = appendSplitted.split(' ');
          detectedVar.push(splittedBySpace[splittedBySpace.length - 1]);
        }
      });
    }

    let value = text1
      .split('\n')
      .filter(line => line.includes('.append'))
      .join('\n');

    detectedVar.forEach(v => {
      value = value
        .replaceAll(`${v}.append(" `, ``)
        .replaceAll(`${v}.append("`, ``)
        .replaceAll(`");`, ``)
        .replaceAll(`Query query = em.createNativeQuery(${v}.toString(), Tuple.class);`, ``);
    });

    setText2(value.trim());
  };

  return (
    <main
      className="min-w-screen min-h-screen"
      style={{ background: theme.palette.background.default, transition: 'background 0.5s' }}
    >
      <div className="absolute right-0 top-0 py-3 px-7">
        <div>
          <IconButton onClick={() => setMode(state => (state === 'light' ? 'dark' : 'light'))}>
            {theme.palette.mode === 'light' ? (
              <FiMoon size={28} color={theme.palette.primary.main} />
            ) : (
              <FiSun size={28} color={theme.palette.primary.light} />
            )}
          </IconButton>
        </div>
      </div>

      <div className="py-10 flex w-full justify-center items-center flex-col">
        <h1 className="text-3xl">{javafy ? 'Javafy SQL' : 'SQLify Java'}</h1>
        <h3 className="text-lg">
          or try{' '}
          <button
            type="button"
            onClick={() => setJavafy(state => !state)}
            className="cursor-pointer hover:underline font-bold"
          >
            {javafy ? 'SQLify' : 'Javafy'}
          </button>
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
        />
        <div className="flex flex-row lg:flex-col justify-around lg:justify-start w-full items-center lg:max-w-24 gap-7 px-2 py-4">
          <Button variant="contained" onClick={javafy ? handleJavafy : handleSQLify}>
            {javafy ? 'Javafy' : 'SQLify'}!
          </Button>

          <div className="flex items-center lg:flex-col">
            {javafy ? 'SQLify' : <b>SQLify</b>}
            <div className="flex lg:rotate-90 lg:transform-gpu lg:my-1">
              <CustomSwitch checked={javafy} onChange={() => setJavafy(state => !state)} />
            </div>
            {javafy ? <b>Javafy</b> : 'Javafy'}
          </div>

          {javafy && (
            <TextField
              value={varName}
              onChange={e => setVarName(e.target.value)}
              label="Var"
              inputProps={{ style: { textAlign: 'center' } }}
              size="small"
              error={varName.length === 0}
            />
          )}
        </div>
        <TextField
          value={text2}
          onChange={e => setText2(e.target.value)}
          multiline
          fullWidth
          minRows={15}
          placeholder={javafy ? 'Here is your javafied query...' : 'Here is your SQL query...'}
        />
      </div>
    </main>
  );
};

export default Main;
