import { init } from '../cube'
export { default as header } from './header';
export { default as user } from './user';
export { default as friend } from './friend';
export { default as loading } from './loading';


// init({
//   effectMeta({ storeMap }) {
//     return {
//       async call(fn: Function, payload: any, config = {} as any) {
//         const result = await fn(payload);
//         const keys = Object.keys(result || {});
//         const { paging, successMsg, errorMsg, fullResult } = config;

//         // 标准格式的返回结果
//         if (keys.includes('success') && (keys.includes('error') || keys.includes('data') || keys.includes('result'))) {
//           const { success, data, error, code, userInfo, result: realResult } = result;
//           const returnResult = data || realResult;
//           // if (storeMap.userMap && userInfo) {
//           //   await storeMap.userMap.reducers.setUserMap(userInfo);
//           // }
//           if (success) {
//             if (successMsg) {
//               console.log('successMsg:', successMsg);
//             }
//           } else {
//             console.log('error', error || code || errorMsg);
//           }
//           return fullResult
//             ? result
//             : returnResult === undefined ? {} : returnResult;
//         } else {
//           if (process.env.NODE_ENV !== 'production') {
//             console.warn('非标准返回接口:', fn.name);
//           }
//           if (successMsg) {
//             console.log('successMsg', successMsg);
//           }
//         }
//       },
//     };
//   },
// });
