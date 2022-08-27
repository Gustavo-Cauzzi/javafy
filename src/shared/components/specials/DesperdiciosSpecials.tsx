import { Checkbox } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SpecialsComponentProps, SpecialsComponentRef } from './common';

const findLastIndex = (array: any[], test: (value: any) => boolean): number => {
  let lastFindedIndex = -1;

  array.forEach((value, index) => {
    if (test(value)) {
      lastFindedIndex = index;
    }
  });

  return lastFindedIndex;
};

const DesperdiciosSpecials = forwardRef<SpecialsComponentRef, SpecialsComponentProps>(({ str, onChange }, ref) => {
  const [hashmap, setHashmap] = useState(false);

  const executeFormatting = (value?: string) => {
    console.log(value ? `value ${value}` : `str ${str}`);
    if (!value && !str) return;
    console.log('hashmap', hashmap);

    const stringToParse = value && value !== '' ? value : str;

    const splitted = stringToParse.split('\n');

    if (hashmap) {
      const indexOfStringBuilder = splitted.findIndex(line => line.includes('StringBuilder'));
      if (indexOfStringBuilder !== -1)
        splitted.splice(indexOfStringBuilder + 1, 0, 'HashMap<String, Object> params = new HashMap<>();');

      const lastParamsPutIndex = findLastIndex(splitted, v => v.includes('query.setParameter'));
      if (lastParamsPutIndex) splitted.splice(lastParamsPutIndex + 1, 0, '', 'params.forEach(query::setParamater);');

      const newValue = splitted.map(line => line.replaceAll('query.setParameter', 'params.put')).join('\n');

      onChange(newValue);
    } else {
      const newValue = splitted
        .filter(
          line =>
            !line.includes('HashMap<String, Object> params') && !line.includes('params.forEach(query::setParamater);'),
        )
        .map(line => line.replaceAll('params.put', 'query.setParameter'))
        .join('\n')
        .replace('\n\n\n', '\n\n');

      onChange(newValue);
    }
  };

  useEffect(() => {
    executeFormatting();
  }, [hashmap]);

  useImperativeHandle(
    ref,
    () => ({
      executeFormatting,
    }),
    [hashmap],
  );

  return (
    <div className="flex lg:flex-col gap-2 justify-center items-center">
      <Checkbox checked={hashmap} onChange={(_e, checked) => setHashmap(checked)} />
      <p className="text-center">Hashmap params</p>
    </div>
  );
});

export default DesperdiciosSpecials;
