import columnify from 'columnify';

export const output = (vpc: any) => {
  Object.keys(vpc).forEach((key) =>{
    console.log('================');
    console.log(vpc[key].msg);
    console.log('================');
    if (!vpc[key].data || vpc[key].data?.length <= 0) {
      console.log('No Resources');
    } else {
      console.log(columnify(vpc[key].data));
    }
    console.log('\n');
  });
}