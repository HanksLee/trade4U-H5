import moment from 'moment';

const buffer = {
  BUFFER_MAXCOUNT: 50,
  BUFFER_TIME: 2000,
  timeId: 0,
  lastCheckUpdateTime: moment().valueOf(),
  list: [],
};


export const initBuffer = (BUFFER_TIME , BUFFER_MAXCOUNT)=>{
    const tmp = Object.assign({} , buffer);

    return {
        ...tmp,
        BUFFER_TIME,
        BUFFER_MAXCOUNT
    };
}


  
export const checkBuffer = (BUFFER_TIME ,BUFFER_MAXCOUNT , maxCount ,lastCheckUpdateTime, receviceTime)=> {
    if (
      receviceTime - lastCheckUpdateTime >= BUFFER_TIME ||
      maxCount >= BUFFER_MAXCOUNT
    )
      return true;
    else return false;
  }