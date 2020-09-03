const operator = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "(": 3,
  ")": 0,
};

export const calculationString = (s)=>{
    const stack = [];
    let sum = 0;
    const rpn = convertRPN(s);
    for(let n of rpn){
        if(isNaN(n)){
            const n1 = stack.pop();
            const n2 = stack.pop();
            sum = calcArithmetic(n1 , n2 , n);
            stack.push(sum);
        }
        else{
            stack.push(n);
        }
    }
    sum = formatSum(sum);
    return sum;
};

/*
    字串公式 - 逆波蘭式轉換
    1. 判斷是否為運算子
    2. 不是累積至 numberQueue
    3. 是的話，取出 numberQueue 組出新數值，放入 rpnResult
    4. 判斷 opStack 是否為空
    5. 不為空判斷運算子優先順序
    6. 當下運算子與 opStack 最後一個運算子比較優先級
    7. 比較大存入 opStack ， 比較小取出 opStack 最後一位塞入 rpnResult
    8. 遇上 '(' 直接進入 opStack 
    9. 遇上 ')' 直接取出 opStack 最後一位塞入 rpnResult

 */
export const convertRPN = (formulaString) => {
  const numberQueue = [];
  const rpnResult = [];
  const opStack = [];

  for (let s of formulaString) {
    if (/^\s*$/.test(s)) {
      continue;
    }

    if (!checkOperator(s)) {
      numberQueue.push(s);
      continue;
    }

    if (numberQueue.length !== 0) {
      const num = getNumber(numberQueue);
      rpnResult.push(num);
      numberQueue.splice(0, numberQueue.length);
    }

    if (opStack.length === 0) {
      opStack.push(s);
    } else {
      const last = opStack[opStack.length - 1];
      const lastLevel = operator[last];

      const sLevel = operator[s];

      if (sLevel >= lastLevel || sLevel === operator["("] || lastLevel === operator["("]) {
        opStack.push(s);
        continue;
      }
      const popCount = getStackPopCount(opStack , s);

      for(let i = 0 ; i < popCount ; i++){
        const top = opStack.pop();
        const topLevel = operator[top];
        
  
        if (topLevel !== operator["("] && topLevel !== operator[")"])
          rpnResult.push(top);
      }

      if (sLevel !== operator[")"]) opStack.push(s);
    }
  }

  //清空剩餘參數
  if (numberQueue.length > 0 || opStack.length > 0) {
    const num = getNumber(numberQueue);
    rpnResult.push(num);

    opStack.forEach((op)=>{
        rpnResult.push(op);
    });
  }

  return rpnResult;
};
const getStackPopCount = (list , key)=>{
    if(key !== ')')
        return 1;
    
    const i = list.lastIndexOf('(');
    return list.length - i;
}
const getNumber = (numList) => {
  let num = "";
  for (let s of numList) {
    num += s;
  }

  return parseFloat(num);
};
const checkOperator = (s) => {
  return Object.keys(operator).indexOf(s) !== -1;
};


const calcArithmetic = (n1 ,n2 , operator)=>{
    let ret = 0;
    switch(operator){
        case '+':
            ret = n1 + n2;
            break;
        case '-':
            ret = n1 - n2;
            break;
        case '*':
            ret = n1 * n2;
            break;
        case '/':
            ret = n1 / n2;
            break;
    }

    return ret;
}

const formatSum = (sum)=>{
    const s = sum.toString();

    const decimal = s.split('.')[1];

    const m = Math.pow(10 , decimal.length);
    return sum*m/m;
}
