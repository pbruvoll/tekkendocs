import { type TableData } from '~/types/TableData'

export const tables: TableData[] = [
  {
    name: 'frames_normal',
    headers: [
      'Command',
      'Hit level',
      'Damage',
      'Start up frame',
      'Block frame',
      'Hit frame',
      'Counter hit frame',
      'Notes',
    ],
    rows: [
      ['1', 'h', '5', 'i10', '+1', '+8', '', 'Alternate input: f+1'],
      ['1,1', 'h,h', '5,6', '', '-1', '+8', '', 'Combo from 1st hit'],
      [
        '1,1,2',
        'h,h,m',
        '5,6,12',
        '',
        '-17',
        'KND',
        'KND',
        '\n* Combo from 1st hit\n* Can be delayed 11F\n',
      ],
      ['1+2', 'mm', '5,20', 'i12', '-13', 'KND', 'KND'],
      ['1,2', 'h,h', '5,8', '', '-1', '+7', '', 'Combo from 1st hit'],
      [
        '1,2,2',
        'h,h,h',
        '5,8,12',
        '',
        '-12',
        '+4',
        '',
        '\n* Combo from 1st hit\n* Combo can be delayed 12F from 1st hit\n* \n',
      ],
      ['1,2,2~3', 'h,h,m', '5,8,23'],
      ['1+2+3+4', 'sp', '-', '', '', '', '', '\n* Shift to charging\n'],
      [
        '1,2,4',
        'h,h,l',
        '5,8,18',
        '',
        '-14',
        '-3',
        '+0c',
        '\n* Combo from 2nd CH\n* Can be delayed 7F\n',
      ],
      [
        '1,2,4,3',
        'h,h,l,m',
        '5,8,18,25',
        '',
        '-2',
        'KND',
        'KND*',
        '\n* Combo from 3rd CH\n* Can be delayed\n',
      ],
      ['2', 'h', '12', 'i12', '-3', '+8'],
      [
        '2,2',
        'h,m',
        '12,24',
        '',
        '-10',
        '+6',
        'KND',
        '\n* Combo from 1st hit\n\n',
      ],
      [
        '2+3',
        'm',
        '15',
        '',
        '',
        '',
        '',
        '\n* \nHeat Burst\n* Alternate input: R1\n',
      ],
      ['3', 'h', '12', 'i14', '-8', '+4', '', 'Alternate input: 3+4'],
      ['3,1', 'h,h', '12,10', '', '-1', '+7', '', 'Combo from 1st hit'],
      [
        '3,1,4',
        'h,h,m',
        '12,10,17',
        '',
        '-6',
        '+8',
        'KND',
        '\n* Combo from 2nd CH\n* Can be delayed 14F\n* Combo can be delayed 6F from CH\n',
      ],
      ['3,1,DF', 'h,h,sp', '12,10,0'],
      ['4', 'h', '18', 'i12', '-9', '+2', 'KND'],
      [
        '4~3',
        'mm',
        '18,25',
        'i31',
        '-10',
        'KND',
        'KND',
        'Alternate input: uf+4~3',
      ],
      ['b+1', 'h', '10', 'i11', '-10', '+1'],
      [
        'b+1+2',
        'm',
        '21',
        'i22',
        '-12',
        '+5',
        'KND',
        '\n* \nHeat Engager\n* Chip damage when guarded',
      ],
      [
        'b+1,2',
        'h,m',
        '10,20',
        '',
        '-14',
        'KND',
        'KND',
        '\n* Combo from 1st hit\n* Can be delayed 14F\n* Combo can be delayed 10F from hit\n',
      ],
      ['b+1+4', 'ub(m)', '60', 'i63', 'LNC', 'LNC', 'LNC'],
      ['b+2', 'm', '12', 'i14', '-8', '+4'],
      ['b+2,2', 'm,m', '12,14'],
      [
        'b+2,2,1+2',
        'm,m,h',
        '12,14,20',
        '',
        '',
        'KND',
        '',
        '\n* Chip damage when guarded\n',
      ],
      [
        'b+2,4',
        'm,h',
        '12,12',
        '',
        '-3',
        '+8',
        '',
        '\n* Combo from 1st hit\n* Can be delayed 10F\n* Combo can be delayed 5F from hit\n',
      ],
      [
        'b+2,4,1',
        'm,h,m',
        '12,12,22',
        '',
        '-14',
        'KND',
        'KND',
        'Combo from 2nd CH',
      ],
      ['b+3', 'h', '15', 'i18', '-8', '+3'],
      ['b+3,1', 'h,h', '15,10', '', '+0', '+6', '', 'Combo from 1st hit'],
      ['b+3,1,4', 'h,h,l', '15,10,10', '', '-10', '+7'],
      ['b+3,1,4,1', 'h,h,l,m', '15,10,10,15', '', '-14', 'KND', 'KND'],
      ['b+3,1,4,3', 'h,h,l,l', '15,10,10,12', '', '-13', '+1'],
      [
        'b+4',
        'h',
        '20',
        'i17',
        '-5',
        '+16Sp',
        'KND',
        '\n* \nHoming\n* \nHeat Engager',
      ],
      [
        '(back to wall).b,b,ub',
        'm',
        '25',
        'i29',
        '-1',
        'KND',
        'KND',
        '\n* Air Status 5F\n',
      ],
      ['BT.1', 'h', '15', 'i8', '-8', '+3'],
      ['BT.3', 'h', '18', 'i10', '-8', 'KND', 'KND'],
      ['BT.d+1', 'sm', '10', 'i10', '-2', '+9'],
      ['BT.d+3', 'l', '12', 'i10', '-11', '+3'],
      ['BT.uf+3', 'm', '-', '', '', 'LNC', 'LNC'],
      [
        'd+1',
        'sm',
        '5',
        'i10',
        '-5',
        '+6',
        '',
        '\n* Returns to standing when input F\n',
      ],
      ['d+1+2', 'l', '20', 'i23', '-14', '+3c', 'KND', '\n* \n'],
      ['d+1+2,B', 'l,sp', '20,0'],
      ['d+2', 'sm', '8', 'i11', '-4', '+7'],
      ['d+3', 'l', '12', 'i16', '-17', '-3'],
      ['d+4', 'l', '7', 'i12', '-13', '-2'],
      ['db+1', 'm', '7', 'i13'],
      [
        'db+1,2',
        'm,mm',
        '7,8,15',
        '',
        '',
        '',
        '',
        '\n* \nHeat Engager\n* Chip damage when guarded\n',
      ],
      ['db+2', 'm', '23', 'i20', '-9c', '+?c', 'KND', '\n'],
      ['db+3', 'l', '14', 'i19~20', '-12', '-1', '+7c', '\n'],
      ['db+4', 'l', '18', 'i20', '-12', '+4', '+17g'],
      ['df+1', 'm', '11', 'i15~16', '-7', '+9'],
      [
        'df+1,2',
        'm,h',
        '11,20',
        'i15',
        '',
        '',
        '',
        '\n* \nHeat Engager\n* Chip damage when guarded\n',
      ],
      [
        'df+1,4',
        'm,h',
        '11,20',
        '',
        '-3',
        '+18Sp',
        '',
        '\n* Combo from 1st hit\n',
      ],
      ['df+1,df+2', 'm,m', '11,22', '', '', '+?c', '', '\n* \nTornado\n'],
      [
        'df+2',
        'm',
        '22',
        'i14',
        '-12',
        '+5',
        'KND',
        '\n* \nHoming\n* Crumple stun +13F after CH',
      ],
      ['df+3', 'm', '13', 'i18', '-7', '+9'],
      [
        'df+3,2',
        'm,m',
        '13,15',
        '',
        '-11',
        '+5',
        '',
        '\n* Combo from 1st hit\n* Can be delayed 10F\n* Combo can be delayed 10F from hit\n',
      ],
      [
        'df+3,2,1',
        'm,m,m',
        '13,15,21',
        '',
        '-18',
        'KND',
        '+24',
        '\n* \nTornado\n* Combo from 2nd CH\n* Can be delayed 16F\n',
      ],
      [
        'df+3,2,1*',
        'm,m,m',
        '13,15,25',
        '',
        '',
        '',
        '',
        '\n* \nTornado\n* Chip damage when guarded\n',
      ],
      ['df+3+4', 'mh', '7,9', 'i18'],
      ['df+3+4,1', 'mh,m', '7,9,15'],
      [
        'df+3+4,1,2',
        'mh,m,sm,sm',
        '7,9,15,14,25',
        '',
        '',
        '',
        '',
        '\n* Chip damage when guarded\n',
      ],
      ['df+4', 'm', '10', 'i13~14', '-9', '+2'],
      [
        'df+4,4',
        'm,m',
        '10,16',
        '',
        '-15',
        '-4c',
        '',
        '\n* Combo from 1st hit\n* Can be delayed 11F\n* Combo can be delayed 11F from hit\n',
      ],
      [
        'DVK.1,1,2,F',
        'h,h,m,th',
        '5,6,12,8',
        'i10',
        '',
        'Th',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.1+4',
        'm',
        '27',
        'i22',
        '',
        'KND',
        '',
        '\n* \nTornado\n* Partially uses remaining Heat time\n* absorb an attack to power up\n',
      ],
      [
        'DVK.3+4',
        'ub(m)',
        '30',
        'i64',
        'KND',
        'KND',
        'KND',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.db+3+4',
        'l',
        '0',
        'i24',
        '',
        '',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.db+3+4,DF',
        'l,sp',
        '0,0',
        '',
        '',
        '',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.f,F+2',
        'm,th',
        '20,20',
        'i16',
        '',
        'Th',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.f,n,d,df+1',
        'm,th',
        '23,15',
        'i20',
        '',
        'Th',
        '',
        '\n* Partially uses remaining Heat time\n* On hit, does not shift to throw with n\n',
      ],
      ['DVK.f,n,d,df+3', 'h,th', '30,15', 'i20', '', 'Th'],
      [
        'DVK.f,n,d,df+4,1,1',
        'l,m,m,th',
        '15,23,16,15',
        'i16',
        '',
        'Th',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.f,n,d,df+4,1,1,B',
        'l,m,m,th,sp',
        '15,23,16,15,0',
        'i16',
        '-17',
        'LNC',
        'LNC',
      ],
      [
        'DVK.OTG.db+1+2',
        'l',
        '20',
        'i24',
        '',
        '',
        '',
        '\n* Partially uses remaining Heat time\n',
      ],
      [
        'DVK.SS.2',
        'm',
        '25',
        'i17',
        '-22',
        'LNC',
        'LNC',
        '\n* Partially uses remaining Heat time\n* \nTornado\n',
      ],
      [
        'DVK.ub+1+2',
        'ub(h)',
        '40',
        'i41',
        'KND',
        'KND',
        'KND',
        '\n* Partially uses remaining Heat time\n* Jack-8 or Alisa can recovery 20 by input 1+2\n',
      ],
      [
        'DVK.uf+1+2',
        'ub(h)',
        '26',
        'i22',
        '',
        '',
        '',
        'Alternate input: DVK.u+1+2',
      ],
      [
        'f+1+2',
        'm',
        '20',
        'i25',
        '-9',
        'KND',
        'KND',
        '\n* Parries high and mid punches\n',
      ],
      [
        'f+2',
        'm',
        '23',
        'i20',
        '-12',
        'KND',
        'KND',
        '\n* absorb an attack to power up\n*  - Add chip damage when guarded\n* \nTornado\n',
      ],
      ['f+3', 'm', '22', 'i17', '-13', '+5', 'KND'],
      ['f+4', 'm', '20', 'i19~20', '+4c', '+7c', 'KND'],
      [
        'FC.1',
        'sm',
        '5',
        'i10',
        '-5',
        '+6',
        '',
        '\n* Returns to standing when input F\n',
      ],
      ['FC.2', 'sm', '8', 'i11', '-4', '+7'],
      ['FC.3', 'l', '12', 'i16', '-17', '-3'],
      ['FC.4', 'l', '10', 'i12', '-15', '-4'],
      ['FC.df+3+4', 'm', '24', 'i23', '-11c', 'KND', 'KND', '\n'],
      ['f,(even numbers frames).n', 'sp'],
      [
        'f,F+2',
        'm',
        '20(,15)',
        'i16',
        '-12',
        'Th',
        'Th',
        '\n* \nHeat Engager\n* Damage () is damage bonus when throw\n',
      ],
      ['f,F+3', 'm', '25', 'i20', '-3c', 'KND', 'KND', '\n'],
      ['f,F+4', 'm', '22', 'i17~18', '-9', '+5', 'KND'],
      [
        'f,f,F+3',
        'm',
        '30',
        'i22~25',
        '+9',
        'KND',
        'KND',
        'Chip damage when guarded',
      ],
      [
        'f,n,d,DF',
        'sp',
        '',
        '',
        '',
        '',
        '',
        '\n* Cannot be buffered\n* Cost 3F\n',
      ],
      [
        'f,n,d,df+1',
        'm',
        '23',
        'i20',
        '-16',
        'LNC',
        'LNC',
        '\n* \nTornado\n* Meaty 1F in actuality\n',
      ],
      [
        'f,n,d,df+1+2',
        'm',
        '25',
        'i24',
        '',
        'KND',
        '',
        '\n* \nTornado\n* Chip damage when guarded\n',
      ],
      [
        'f,n,d,df+2',
        'h',
        '20',
        'i11',
        '-10',
        'LNC',
        'LNC',
        'Becomes Electric Wind God Fist during Heat (partially uses remaining Heat Time)',
      ],
      [
        'f,n,d,df:2',
        'h',
        '23',
        'i11',
        '+5',
        'LNC',
        'LNC',
        '\n* Chip damage when guarded\n* Total 36F on block or hit\n',
      ],
      ['f,n,d,df+3', 'h', '30', 'i20~29', '-9', 'KND', 'KND'],
      [
        'f,n,d,df+4',
        'l',
        '15',
        'i16',
        '-23',
        '-3c',
        'KND',
        '\n* Disable 2nd from 1st block\n* 2nd input force to down\n',
      ],
      ['f,n,d,df+4,1', 'l,m', '15,23', '', '-16', 'KND', 'KND'],
      ['f,n,d,df+4,4', 'l,h', '1515,25'],
      [
        'f,n,DF',
        'sp',
        '',
        '',
        '',
        '',
        '',
        '\n* Cannot be buffered\n* Connect to Wind God Step\n* Cost: 2F\n',
      ],
      ['f,(odd numbers frames).n', 'sp'],
      [
        'H.2+3',
        'l,m,th',
        '12,20,34',
        'i18',
        '',
        'Th',
        'Th',
        '\n* \nHeat Smash\n* Alternate input: R1\n',
      ],
      [
        'H.b+1+2,F',
        'm',
        '21',
        'i22',
        '',
        '',
        '',
        '\n* Chip damage when guarded\n* Shift to Devil Form on Heat Activation\n',
      ],
      [
        'H.b+4,F',
        'h',
        '20',
        'i17',
        '',
        '',
        '',
        '\n* \nHoming\n* Shift to Devil Form on Heat Activation\n',
      ],
      [
        'H.db+1,2,F',
        'm,mm',
        '7,8,15',
        'i13',
        '',
        '',
        '',
        '\n* Chip damage when guarded\n* Shift to Devil Form on Heat Activation\n',
      ],
      [
        'H.df+1,2,F',
        'm,h',
        '11,20',
        'i15',
        '',
        '',
        '',
        '\n* Chip damage when guarded\n* Shift to Devil Form on Heat Activation\n',
      ],
      [
        'H.f,F+2,F',
        'm',
        '20',
        'i16',
        '',
        '',
        '',
        '\n* Chip damage when guarded\n* Shift to Devil Form on Heat Activation\n',
      ],
      ['OTG.d+3+4', 'l', '25', 'i23', '-12', '-1'],
      [
        'R.df+1+2',
        'm,th',
        '10,45',
        '',
        '',
        '',
        '',
        "\n* Erases opponent's recoverable health on hit\n* Alternate input: R2\n",
      ],
      ['SS.1+2', 'h', '25', 'i19', '-9', 'KND', 'KND*', '\n'],
      ['SS.3', 'm', '23', 'i23', '-7', 'KND', 'KND'],
      ['u+3', 'm', '25', 'i19', '-9', 'KND', 'KND', 'Alternate input: uf+3'],
      [
        'ub+1',
        'm',
        '12',
        'i18',
        '-12',
        '-1',
        '',
        '\n* Alternate input:\n** u+1\n** uf+1',
      ],
      [
        'ub+1+2',
        'h',
        '32',
        'i41',
        'KND',
        'KND',
        'KND',
        '\n* Chip damage when guarded\n* Jack-8 or Alisa can recovery 20 by input 1+2\n',
      ],
      [
        'ub+2',
        'h',
        '17',
        'i15',
        '-12',
        '+9',
        '',
        '\n* Alternate input:\n** u+2\n** uf+2',
      ],
      ['ub+3', 'm', '25', 'i21', '-17', 'KND', 'KND'],
      ['ub,4', 'm', '11', 'i15', '-19', '-8'],
      ['uf+4', 'm', '16', 'i25', '-12', '-1', '', 'Alternate input: u+4'],
      ['uf+4,4', 'm,l', '16,12', '', '-23', 'KND', 'KND', 'Combo from 1st CH'],
      ['uf+4,4,4', 'm,l,l', '16,12,10', '', '-23', 'KND', 'KND'],
      ['uf+4,4,4,4', 'm,l,l,m', '16,12,10,20', '', '-17', 'KND', 'KND'],
      ['uf,n,4', 'm', '20', 'i23', '-11', 'LNC', 'LNC'],
      ['ws1', 'm', '10', 'i13', '-5', '+5'],
      [
        'ws1+2',
        'm',
        '25',
        'i13',
        '-9',
        '+11g (+23w)',
        '',
        '[[:Template:WallCrush]]',
      ],
      [
        'ws1,2',
        'm,m',
        '10,12',
        '',
        '-12',
        'LNC',
        'LNC',
        '\n* Combo from 1st hit\n* \nTornado\n',
      ],
      ['ws2', 'm', '25', 'i16', '-18', 'KND', 'KND', 'Homing'],
      [
        'ws3',
        'm',
        '24',
        'i21',
        '-5',
        'KND',
        'KND',
        '\n* \nHoming\n* Meaty 1F in actuality',
      ],
      ['ws4', 'm', '13', 'i11~12', '-3', '+8'],
      [
        'ws4,4',
        'm,m',
        '13,16',
        '',
        '-15',
        '-4c',
        '-4c',
        '\n* Combo from 1st hit\n',
      ],
    ],
  },
]