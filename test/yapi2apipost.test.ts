import yapi2apipost from '../src/yapi2apipost'
let path = require('path')
let fs = require('fs')

describe('works',async () => {
  let yapiJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/yapi1.json'), 'utf-8'));
  let Yapi2apipost=new yapi2apipost();
  let result=await Yapi2apipost.convert(yapiJson);
  console.log('yapi2apipost result',JSON.stringify(result));
  
  it('yapi2apipost test', () => {
    expect(result.status).toBe('success');
  });
});

